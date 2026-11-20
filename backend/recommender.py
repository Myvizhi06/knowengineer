import pandas as pd
from datetime import datetime
from mlxtend.frequent_patterns import apriori, association_rules
from database import get_db_connection

def mine_association_rules(min_support: float = 0.02, min_confidence: float = 0.15, min_lift: float = 1.0):
    """
    Executes the Apriori algorithm on historical supermarket transaction data
    and updates the Product_Relationships table (Knowledge Base).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query all transaction items
    query = """
    SELECT transaction_id, product_id
    FROM transaction_items
    ORDER BY transaction_id, product_id;
    """
    items_df = pd.read_sql_query(query, conn)

    if items_df.empty or items_df['transaction_id'].nunique() < 5:
        conn.close()
        return {
            "status": "warning",
            "message": "Not enough transaction data to mine association rules (minimum 5 required).",
            "rules_count": 0
        }

    # Group into transaction baskets and one-hot encode
    basket = (items_df.groupby(['transaction_id', 'product_id'])['product_id']
              .count().unstack().reset_index().fillna(0)
              .set_index('transaction_id'))
    
    # Convert to boolean format expected by mlxtend
    basket_sets = basket.map(lambda x: True if x > 0 else False)

    try:
        # Run Apriori Algorithm to find frequent itemsets
        frequent_itemsets = apriori(basket_sets, min_support=min_support, use_colnames=True)

        if frequent_itemsets.empty:
            conn.close()
            return {
                "status": "info",
                "message": "No frequent itemsets met the minimum support threshold.",
                "rules_count": 0
            }

        # Generate association rules
        rules = association_rules(frequent_itemsets, metric="lift", min_threshold=min_lift)
        
        # Filter by minimum confidence
        rules = rules[rules['confidence'] >= min_confidence]

        if rules.empty:
            conn.close()
            return {
                "status": "info",
                "message": "No rules met the confidence threshold.",
                "rules_count": 0
            }

        # Clear existing dynamic rules in product_relationships table
        cursor.execute("DELETE FROM product_relationships;")

        # Fetch product names for semantic descriptions
        products_cursor = cursor.execute("SELECT product_id, product_name FROM products;").fetchall()
        product_names = {row['product_id']: row['product_name'] for row in products_cursor}

        timestamp = datetime.now().isoformat()
        inserted_count = 0

        # We will parse single & multi-item antecedent rules
        # For direct 1-to-1 representation, unpack frozensets
        for _, row in rules.iterrows():
            antecedents = list(row['antecedents'])
            consequents = list(row['consequents'])

            support_val = float(row['support'])
            confidence_val = float(row['confidence'])
            lift_val = float(row['lift'])

            # Store binary relationships for knowledge graph & recommendations
            for a_id in antecedents:
                for b_id in consequents:
                    if a_id == b_id:
                        continue
                    
                    a_name = product_names.get(a_id, f"Product #{a_id}")
                    b_name = product_names.get(b_id, f"Product #{b_id}")
                    description = f"IF customer purchases '{a_name}' THEN recommend '{b_name}'"

                    cursor.execute("""
                    INSERT INTO product_relationships 
                    (product_a, product_b, support, confidence, lift, rule_description, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                    """, (int(a_id), int(b_id), support_val, confidence_val, lift_val, description, timestamp))
                    inserted_count += 1

        conn.commit()
        conn.close()

        return {
            "status": "success",
            "message": f"Successfully mined and stored {inserted_count} association rules.",
            "rules_count": inserted_count
        }

    except Exception as e:
        conn.close()
        return {
            "status": "error",
            "message": f"Apriori rule mining failed: {str(e)}",
            "rules_count": 0
        }

def get_recommendations_for_cart(cart_product_ids: list[int], limit: int = 4):
    """
    Knowledge Representation & Apriori Recommendation Logic:
    1. Identify products in the customer's cart.
    2. Analyze association rules where antecedent is in cart.
    3. Find products related to the selected products (not in cart).
    4. Rank recommendations based on lift and confidence.
    5. Avoid recommending products already in the cart.
    6. Return top recommendations, with fallback category companions if needed.
    """
    if not cart_product_ids:
        # If cart is empty, recommend top popular products
        return get_fallback_popular_recommendations(limit=limit, exclude_ids=[])

    conn = get_db_connection()
    cursor = conn.cursor()

    placeholders = ",".join("?" for _ in cart_product_ids)

    # 1. Query rules matching items currently in cart
    rules_query = f"""
    SELECT pr.product_b, pr.product_a, pr.support, pr.confidence, pr.lift, pr.rule_description,
           p_a.product_name AS trigger_name,
           p_b.product_name, p_b.category, p_b.price, p_b.image_url, p_b.description
    FROM product_relationships pr
    JOIN products p_a ON pr.product_a = p_a.product_id
    JOIN products p_b ON pr.product_b = p_b.product_id
    WHERE pr.product_a IN ({placeholders})
    ORDER BY pr.lift DESC, pr.confidence DESC;
    """
    matched_rules = cursor.execute(rules_query, cart_product_ids).fetchall()

    recommended_map = {}
    cart_set = set(cart_product_ids)

    for rule in matched_rules:
        target_id = rule['product_b']
        # Rule 5: Avoid recommending products already in the cart
        if target_id in cart_set:
            continue

        # Score combining lift and confidence
        score = rule['lift'] * 10.0 + rule['confidence'] * 5.0

        if target_id not in recommended_map or score > recommended_map[target_id]['score']:
            confidence_pct = round(rule['confidence'] * 100, 1)
            lift_val = round(rule['lift'], 2)
            trigger = rule['trigger_name']
            target = rule['product_name']

            explanation = (
                f"Frequently bought together with {trigger}: {confidence_pct}% of customers who bought "
                f"{trigger} also purchased {target} (Lift: {lift_val}x)."
            )

            recommended_map[target_id] = {
                "product_id": target_id,
                "product_name": rule['product_name'],
                "category": rule['category'],
                "price": rule['price'],
                "image_url": rule['image_url'],
                "description": rule['description'],
                "score": round(score, 2),
                "support": round(rule['support'], 4),
                "confidence": round(rule['confidence'], 4),
                "lift": round(rule['lift'], 2),
                "recommendation_type": "association_rule",
                "trigger_product_name": trigger,
                "explanation": explanation
            }

    # Sort recommended products by score descending
    recommendations = sorted(recommended_map.values(), key=lambda x: x['score'], reverse=True)

    # Rule 6 & Fallback: If fewer than requested limit, provide fallback from same category or popular products
    if len(recommendations) < limit:
        needed = limit - len(recommendations)
        already_recommended = set(recommended_map.keys()) | cart_set

        # Get categories of cart products
        cat_query = f"""
        SELECT DISTINCT category FROM products WHERE product_id IN ({placeholders});
        """
        cart_categories = [r['category'] for r in cursor.execute(cat_query, cart_product_ids).fetchall()]

        if cart_categories:
            cat_placeholders = ",".join("?" for _ in cart_categories)
            fallback_query = f"""
            SELECT p.product_id, p.product_name, p.category, p.price, p.image_url, p.description,
                   COUNT(ti.id) as buy_count
            FROM products p
            LEFT JOIN transaction_items ti ON p.product_id = ti.product_id
            WHERE p.category IN ({cat_placeholders})
            GROUP BY p.product_id
            ORDER BY buy_count DESC, p.price ASC;
            """
            category_candidates = cursor.execute(fallback_query, cart_categories).fetchall()

            for cand in category_candidates:
                cid = cand['product_id']
                if cid not in already_recommended and len(recommendations) < limit:
                    already_recommended.add(cid)
                    recommendations.append({
                        "product_id": cid,
                        "product_name": cand['product_name'],
                        "category": cand['category'],
                        "price": cand['price'],
                        "image_url": cand['image_url'],
                        "description": cand['description'],
                        "score": 1.0,
                        "support": None,
                        "confidence": None,
                        "lift": None,
                        "recommendation_type": "category_fallback",
                        "trigger_product_name": f"{cand['category']} Department",
                        "explanation": f"Recommended because you have items from the {cand['category']} category in your cart."
                    })

        # If still needed, fill with general best sellers
        if len(recommendations) < limit:
            bestsellers = get_fallback_popular_recommendations(limit=limit - len(recommendations), exclude_ids=list(already_recommended))
            recommendations.extend(bestsellers)

    conn.close()
    return recommendations[:limit]

def get_product_recommendations(product_id: int, limit: int = 4):
    """
    Returns recommendations specifically tailored to a single selected product.
    Used on the Product Details page.
    """
    return get_recommendations_for_cart([product_id], limit=limit)

def get_fallback_popular_recommendations(limit: int = 4, exclude_ids: list[int] = None):
    """
    Fallback method when no transaction rules apply: returns top purchased products.
    """
    if exclude_ids is None:
        exclude_ids = []

    conn = get_db_connection()
    cursor = conn.cursor()

    exclude_clause = ""
    params = []
    if exclude_ids:
        placeholders = ",".join("?" for _ in exclude_ids)
        exclude_clause = f"WHERE p.product_id NOT IN ({placeholders})"
        params = exclude_ids

    query = f"""
    SELECT p.product_id, p.product_name, p.category, p.price, p.image_url, p.description,
           COUNT(ti.id) as buy_count
    FROM products p
    LEFT JOIN transaction_items ti ON p.product_id = ti.product_id
    {exclude_clause}
    GROUP BY p.product_id
    ORDER BY buy_count DESC, p.product_id ASC
    LIMIT ?;
    """
    params.append(limit)
    rows = cursor.execute(query, params).fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "product_id": row['product_id'],
            "product_name": row['product_name'],
            "category": row['category'],
            "price": row['price'],
            "image_url": row['image_url'],
            "description": row['description'],
            "score": 1.5,
            "support": None,
            "confidence": None,
            "lift": None,
            "recommendation_type": "popular_fallback",
            "trigger_product_name": "Store Best-Seller",
            "explanation": "One of our top popular items frequently purchased by supermarket customers."
        })
    return results

def get_knowledge_graph():
    """
    Retrieves nodes and edges for the Knowledge Graph network visualization.
    Nodes = Products
    Edges = Mined Apriori Association Rules (product_a -> product_b)
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query all active rules with lift > 1.05 and confidence > 0.2 to display meaningful relations
    rules_query = """
    SELECT pr.id, pr.product_a, pr.product_b, pr.support, pr.confidence, pr.lift, pr.rule_description,
           p1.product_name as name_a, p1.category as cat_a, p1.price as price_a, p1.image_url as img_a,
           p2.product_name as name_b, p2.category as cat_b, p2.price as price_b, p2.image_url as img_b
    FROM product_relationships pr
    JOIN products p1 ON pr.product_a = p1.product_id
    JOIN products p2 ON pr.product_b = p2.product_id
    WHERE pr.lift >= 1.05
    ORDER BY pr.lift DESC;
    """
    rules = cursor.execute(rules_query).fetchall()

    nodes_dict = {}
    edges = []
    categories = set()

    for r in rules:
        p_a = r['product_a']
        p_b = r['product_b']

        categories.add(r['cat_a'])
        categories.add(r['cat_b'])

        if p_a not in nodes_dict:
            nodes_dict[p_a] = {
                "id": p_a,
                "label": r['name_a'],
                "category": r['cat_a'],
                "price": r['price_a'],
                "image_url": r['img_a'],
                "size": 26
            }
        
        if p_b not in nodes_dict:
            nodes_dict[p_b] = {
                "id": p_b,
                "label": r['name_b'],
                "category": r['cat_b'],
                "price": r['price_b'],
                "image_url": r['img_b'],
                "size": 26
            }

        edges.append({
            "id": f"edge_{r['id']}",
            "from": p_a,
            "to": p_b,
            "support": round(r['support'], 3),
            "confidence": round(r['confidence'], 3),
            "lift": round(r['lift'], 2),
            "label": f"Lift: {round(r['lift'], 2)}x",
            "arrows": "to"
        })

    # If no rules are mined yet, include all products as standalone nodes
    if not nodes_dict:
        all_products = cursor.execute("SELECT product_id, product_name, category, price, image_url FROM products LIMIT 30;").fetchall()
        for p in all_products:
            categories.add(p['category'])
            nodes_dict[p['product_id']] = {
                "id": p['product_id'],
                "label": p['product_name'],
                "category": p['category'],
                "price": p['price'],
                "image_url": p['image_url'],
                "size": 24
            }

    conn.close()

    return {
        "nodes": list(nodes_dict.values()),
        "edges": edges,
        "total_rules": len(edges),
        "categories": sorted(list(categories))
    }
