from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import sqlite3

from database import get_db_connection, init_db
from schemas import (
    ProductCreate, ProductUpdate, ProductResponse,
    CheckoutRequest, TransactionResponse,
    CartRecommendationRequest, RecommendationResponse,
    KnowledgeGraphResponse, AnalyticsResponse
)
from recommender import (
    get_recommendations_for_cart,
    get_product_recommendations,
    mine_association_rules,
    get_knowledge_graph
)
from seed_data import seed_database

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes the database and checks if seed data is needed."""
    init_db()
    conn = get_db_connection()
    count = conn.cursor().execute("SELECT COUNT(*) FROM products;").fetchone()[0]
    conn.close()
    if count == 0:
        print("Empty database detected. Seeding sample dataset and mining initial rules...")
        seed_database()
    yield

app = FastAPI(
    title="SmartCart – Intelligent Supermarket Product Recommendation API",
    description="Full-stack Knowledge Representation & Market Basket Analysis API using Apriori Algorithm and FastAPI.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite frontend (localhost:5173) and any local dev origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "SmartCart API",
        "status": "online",
        "docs_url": "/docs",
        "message": "Welcome to SmartCart Market Basket Recommendation System API"
    }

# ==========================================
# 1. Product Endpoints (CRUD)
# ==========================================

@app.get("/products", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "id"
):
    """Retrieve all supermarket products with optional category and search filters."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if category and isinstance(category, str) and category.lower() != "all":
        query += " AND category = ?"
        params.append(category)

    if search and isinstance(search, str):
        query += " AND (product_name LIKE ? OR description LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term])

    if sort == "price_asc":
        query += " ORDER BY price ASC"
    elif sort == "price_desc":
        query += " ORDER BY price DESC"
    elif sort == "name":
        query += " ORDER BY product_name ASC"
    else:
        query += " ORDER BY product_id ASC"

    rows = cursor.execute(query, params).fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):
    """Retrieve details of a single product by ID."""
    conn = get_db_connection()
    row = conn.cursor().execute("SELECT * FROM products WHERE product_id = ?;", (product_id,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found.")
    return dict(row)

@app.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate):
    """Admin endpoint: Add a new supermarket product."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO products (product_name, category, price, image_url, description, stock)
    VALUES (?, ?, ?, ?, ?, ?);
    """, (product.product_name, product.category, product.price, product.image_url, product.description, product.stock))
    
    new_id = cursor.lastrowid
    conn.commit()
    new_row = cursor.execute("SELECT * FROM products WHERE product_id = ?;", (new_id,)).fetchone()
    conn.close()
    return dict(new_row)

@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_update: ProductUpdate):
    """Admin endpoint: Update an existing product."""
    conn = get_db_connection()
    cursor = conn.cursor()

    existing = cursor.execute("SELECT * FROM products WHERE product_id = ?;", (product_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found.")

    update_fields = []
    params = []

    if product_update.product_name is not None:
        update_fields.append("product_name = ?")
        params.append(product_update.product_name)
    if product_update.category is not None:
        update_fields.append("category = ?")
        params.append(product_update.category)
    if product_update.price is not None:
        update_fields.append("price = ?")
        params.append(product_update.price)
    if product_update.image_url is not None:
        update_fields.append("image_url = ?")
        params.append(product_update.image_url)
    if product_update.description is not None:
        update_fields.append("description = ?")
        params.append(product_update.description)
    if product_update.stock is not None:
        update_fields.append("stock = ?")
        params.append(product_update.stock)

    if update_fields:
        params.append(product_id)
        sql = f"UPDATE products SET {', '.join(update_fields)} WHERE product_id = ?;"
        cursor.execute(sql, params)
        conn.commit()

    updated = cursor.execute("SELECT * FROM products WHERE product_id = ?;", (product_id,)).fetchone()
    conn.close()
    return dict(updated)

@app.delete("/products/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(product_id: int):
    """Admin endpoint: Delete a product by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    existing = cursor.execute("SELECT * FROM products WHERE product_id = ?;", (product_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found.")

    cursor.execute("DELETE FROM products WHERE product_id = ?;", (product_id,))
    conn.commit()
    conn.close()
    return {"message": f"Product #{product_id} deleted successfully."}

# ==========================================
# 2. Recommendation Endpoints
# ==========================================

@app.post("/cart/recommendations", response_model=RecommendationResponse)
def get_cart_recommendations(req: CartRecommendationRequest):
    """
    Intelligent Cart Recommendation Engine:
    - Finds products frequently bought together with items currently in the cart.
    - Evaluates association rules mined using the Apriori algorithm.
    - Ranks by Lift and Confidence.
    - Eliminates products already in the cart.
    - Provides category and best-seller fallback when necessary.
    - Explains WHY each product was recommended.
    """
    recs = get_recommendations_for_cart(req.cart_product_ids, limit=req.limit or 4)
    return {
        "recommendations": recs,
        "based_on_product_ids": req.cart_product_ids,
        "total_recommended": len(recs)
    }

@app.get("/recommendations/{product_id}", response_model=RecommendationResponse)
def get_single_product_recommendations(product_id: int, limit: int = 4):
    """
    Returns frequently bought together recommendations for a specific product.
    Includes natural language reasoning and metrics.
    """
    # Check product existence
    conn = get_db_connection()
    prod = conn.cursor().execute("SELECT product_id FROM products WHERE product_id = ?;", (product_id,)).fetchone()
    conn.close()

    if not prod:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found.")

    recs = get_product_recommendations(product_id, limit=limit)
    return {
        "recommendations": recs,
        "based_on_product_ids": [product_id],
        "total_recommended": len(recs)
    }

# ==========================================
# 3. Transaction Endpoints
# ==========================================

@app.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(limit: int = 50, offset: int = 0):
    """Retrieve historical checkout transactions with nested product items."""
    conn = get_db_connection()
    cursor = conn.cursor()

    tx_rows = cursor.execute("""
    SELECT transaction_id, transaction_date, total_amount
    FROM transactions
    ORDER BY transaction_id DESC
    LIMIT ? OFFSET ?;
    """, (limit, offset)).fetchall()

    results = []
    for tx in tx_rows:
        t_id = tx['transaction_id']
        items = cursor.execute("""
        SELECT ti.product_id, ti.quantity, p.product_name, p.category, p.price, (p.price * ti.quantity) as subtotal
        FROM transaction_items ti
        JOIN products p ON ti.product_id = p.product_id
        WHERE ti.transaction_id = ?;
        """, (t_id,)).fetchall()

        item_list = [dict(it) for it in items]
        results.append({
            "transaction_id": t_id,
            "transaction_date": tx['transaction_date'],
            "total_amount": round(tx['total_amount'], 2),
            "item_count": sum(it['quantity'] for it in item_list),
            "items": item_list
        })

    conn.close()
    return results

@app.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(checkout: CheckoutRequest):
    """
    Checkout simulation: Records customer order in SQLite database.
    Increases historical transaction dataset, allowing dynamic Apriori re-learning!
    """
    if not checkout.items:
        raise HTTPException(status_code=400, detail="Cannot create transaction with empty cart items.")

    conn = get_db_connection()
    cursor = conn.cursor()

    total_amount = 0.0
    item_details = []

    # Validate products and calculate total
    for item in checkout.items:
        prod = cursor.execute("SELECT product_id, product_name, category, price, stock FROM products WHERE product_id = ?;",
                              (item.product_id,)).fetchone()
        if not prod:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found.")

        subtotal = prod['price'] * item.quantity
        total_amount += subtotal
        item_details.append({
            "product_id": prod['product_id'],
            "product_name": prod['product_name'],
            "category": prod['category'],
            "price": prod['price'],
            "quantity": item.quantity,
            "subtotal": round(subtotal, 2)
        })

    # Insert into transactions
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT INTO transactions (transaction_date, total_amount) VALUES (?, ?);",
                   (now_str, round(total_amount, 2)))
    new_tx_id = cursor.lastrowid

    # Insert into transaction_items
    for item in checkout.items:
        cursor.execute("""
        INSERT INTO transaction_items (transaction_id, product_id, quantity)
        VALUES (?, ?, ?);
        """, (new_tx_id, item.product_id, item.quantity))

    conn.commit()
    conn.close()

    return {
        "transaction_id": new_tx_id,
        "transaction_date": now_str,
        "total_amount": round(total_amount, 2),
        "item_count": sum(it['quantity'] for it in item_details),
        "items": item_details
    }

# ==========================================
# 4. Analytics & Knowledge Representation Endpoints
# ==========================================

@app.get("/analytics", response_model=AnalyticsResponse)
def get_analytics():
    """Returns supermarket purchasing statistics, top products, and association metrics."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total counts
    total_products = cursor.execute("SELECT COUNT(*) FROM products;").fetchone()[0]
    total_tx = cursor.execute("SELECT COUNT(*) FROM transactions;").fetchone()[0]
    total_rev = cursor.execute("SELECT COALESCE(SUM(total_amount), 0.0) FROM transactions;").fetchone()[0]
    avg_order = round(total_rev / total_tx, 2) if total_tx > 0 else 0.0
    total_rules = cursor.execute("SELECT COUNT(*) FROM product_relationships;").fetchone()[0]

    # Top purchased products
    top_prods_query = """
    SELECT p.product_id, p.product_name, p.category, 
           COALESCE(SUM(ti.quantity), 0) as purchase_count,
           COALESCE(SUM(ti.quantity * p.price), 0.0) as total_revenue
    FROM products p
    LEFT JOIN transaction_items ti ON p.product_id = ti.product_id
    GROUP BY p.product_id
    ORDER BY purchase_count DESC
    LIMIT 10;
    """
    top_prods = [dict(r) for r in cursor.execute(top_prods_query).fetchall()]

    # Top association rules
    top_rules_query = """
    SELECT pr.id as rule_id, p1.product_name as antecedent, p2.product_name as consequent,
           pr.support, pr.confidence, pr.lift, pr.rule_description
    FROM product_relationships pr
    JOIN products p1 ON pr.product_a = p1.product_id
    JOIN products p2 ON pr.product_b = p2.product_id
    ORDER BY pr.lift DESC, pr.confidence DESC
    LIMIT 10;
    """
    top_rules_rows = cursor.execute(top_rules_query).fetchall()
    top_rules = []
    for r in top_rules_rows:
        top_rules.append({
            "rule_id": r['rule_id'],
            "antecedent": r['antecedent'],
            "consequent": r['consequent'],
            "support": round(r['support'], 4),
            "confidence": round(r['confidence'], 4),
            "lift": round(r['lift'], 2),
            "explanation": f"IF buy {r['antecedent']} -> THEN {r['consequent']} (Lift {round(r['lift'], 2)}x, Conf {round(r['confidence'] * 100, 1)}%)"
        })

    # Category distribution
    cat_query = "SELECT category, COUNT(*) as count FROM products GROUP BY category;"
    cat_dist = {r['category']: r['count'] for r in cursor.execute(cat_query).fetchall()}

    conn.close()

    return {
        "total_products": total_products,
        "total_transactions": total_tx,
        "total_revenue": round(total_rev, 2),
        "average_order_value": avg_order,
        "total_association_rules": total_rules,
        "top_products": top_prods,
        "top_rules": top_rules,
        "category_distribution": cat_dist
    }

@app.get("/knowledge/relationships", response_model=KnowledgeGraphResponse)
def get_knowledge_relationships():
    """
    Returns graph representation of supermarket product relationships:
    - Nodes: Products categorized and styled
    - Edges: Apriori Association Rules connecting antecedent -> consequent with support, confidence, lift
    """
    return get_knowledge_graph()

@app.post("/knowledge/retrain")
def retrain_association_rules(
    min_support: float = 0.02,
    min_confidence: float = 0.15,
    min_lift: float = 1.0
):
    """
    Admin trigger: Re-runs the Apriori algorithm over all historical transactions
    to discover updated association rules dynamically.
    """
    result = mine_association_rules(
        min_support=float(min_support),
        min_confidence=float(min_confidence),
        min_lift=float(min_lift)
    )
    return result

@app.post("/seed-data")
def trigger_seed():
    """Resets and regenerates the sample dataset with 32 products and 135+ transactions."""
    seed_database()
    return {"message": "Sample dataset seeded and association rules re-mined successfully."}
