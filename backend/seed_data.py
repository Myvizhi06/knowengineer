import random
from datetime import datetime, timedelta
from database import get_db_connection, init_db
from recommender import mine_association_rules

SAMPLE_PRODUCTS = [
    # 1. Fruits (4 products)
    {
        "product_name": "Organic Cavendish Bananas",
        "category": "Fruits",
        "price": 1.99,
        "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80",
        "description": "Sweet, naturally ripened organic bananas rich in potassium and healthy energy.",
        "stock": 100
    },
    {
        "product_name": "Crisp Royal Gala Apples",
        "category": "Fruits",
        "price": 3.49,
        "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80",
        "description": "Juicy, sweet and crunchy fresh apples perfect for daily snacking and salads.",
        "stock": 85
    },
    {
        "product_name": "Fresh Sweet Oranges",
        "category": "Fruits",
        "price": 2.99,
        "image_url": "https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=80",
        "description": "Vitamin C packed citrus oranges, juicy and fresh for healthy breakfasts.",
        "stock": 70
    },
    {
        "product_name": "Fresh Farm Strawberries",
        "category": "Fruits",
        "price": 4.29,
        "image_url": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80",
        "description": "Hand-picked ripe red strawberries, great with yogurt, cakes, and cereal.",
        "stock": 60
    },

    # 2. Vegetables (4 products)
    {
        "product_name": "Vine-Ripened Fresh Tomatoes",
        "category": "Vegetables",
        "price": 2.49,
        "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
        "description": "Plump and flavorful red tomatoes, essential for curries, pasta sauces, and fresh salads.",
        "stock": 90
    },
    {
        "product_name": "Golden Yellow Onions",
        "category": "Vegetables",
        "price": 1.79,
        "image_url": "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop&q=80",
        "description": "Pungent and versatile culinary base onions for all everyday cooking needs.",
        "stock": 110
    },
    {
        "product_name": "Crisp Russet Potatoes",
        "category": "Vegetables",
        "price": 2.99,
        "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80",
        "description": "Hearty russet potatoes ideal for mashing, baking, frying, and hearty stews.",
        "stock": 120
    },
    {
        "product_name": "Baby Spinach Leaves",
        "category": "Vegetables",
        "price": 2.99,
        "image_url": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80",
        "description": "Tender pre-washed baby spinach leaves packed with iron and vitamins.",
        "stock": 45
    },

    # 3. Dairy (4 products)
    {
        "product_name": "Farm Fresh Whole Milk",
        "category": "Dairy",
        "price": 3.69,
        "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80",
        "description": "Creamy pasteurized whole milk from local dairy farms, rich in calcium and protein.",
        "stock": 80
    },
    {
        "product_name": "Creamy Salted Butter",
        "category": "Dairy",
        "price": 4.19,
        "image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80",
        "description": "Rich golden salted butter made from pure sweet cream, perfect for spreading and baking.",
        "stock": 75
    },
    {
        "product_name": "Aged Cheddar Cheese Block",
        "category": "Dairy",
        "price": 5.49,
        "image_url": "https://images.unsplash.com/photo-1618060932014-4deda4932554?w=500&auto=format&fit=crop&q=80",
        "description": "Sharp cheddar cheese aged for 9 months, delicious in sandwiches and baked pasta.",
        "stock": 65
    },
    {
        "product_name": "Plain Greek Yogurt",
        "category": "Dairy",
        "price": 3.89,
        "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80",
        "description": "Thick and protein-rich authentic Greek yogurt with gut-friendly probiotics.",
        "stock": 50
    },

    # 4. Bakery (4 products)
    {
        "product_name": "Whole Wheat Artisan Bread",
        "category": "Bakery",
        "price": 2.89,
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
        "description": "Freshly baked 100% whole grain loaf with a golden crust and soft slice texture.",
        "stock": 70
    },
    {
        "product_name": "Strawberry Fruit Jam",
        "category": "Bakery",
        "price": 3.29,
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
        "description": "Traditional sweet strawberry preserve loaded with real fruit pieces.",
        "stock": 60
    },
    {
        "product_name": "Butter Croissants (4-Pack)",
        "category": "Bakery",
        "price": 4.99,
        "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
        "description": "Flaky, golden French-style butter croissants, oven-fresh and melt-in-the-mouth.",
        "stock": 40
    },
    {
        "product_name": "Chocolate Chip Muffins",
        "category": "Bakery",
        "price": 3.99,
        "image_url": "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500&auto=format&fit=crop&q=80",
        "description": "Soft and decadent breakfast muffins studded with Belgian chocolate chips.",
        "stock": 50
    },

    # 5. Beverages (4 products)
    {
        "product_name": "Dark Roast Coffee Powder",
        "category": "Beverages",
        "price": 6.99,
        "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80",
        "description": "Aromatic 100% Arabica dark roast ground coffee with hints of cocoa and toasted nuts.",
        "stock": 80
    },
    {
        "product_name": "Pure Cane Sugar (1kg)",
        "category": "Beverages",
        "price": 2.29,
        "image_url": "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80",
        "description": "Fine crystal granulated pure cane sugar for baking, coffee, and daily sweetening.",
        "stock": 95
    },
    {
        "product_name": "Organic Green Tea Bags",
        "category": "Beverages",
        "price": 4.49,
        "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
        "description": "Soothing organic green tea leaves rich in antioxidants for clean energy.",
        "stock": 65
    },
    {
        "product_name": "Sparkling Citrus Soda (6-Pack)",
        "category": "Beverages",
        "price": 5.29,
        "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
        "description": "Refreshing sparkling lemon-lime soda with crisp natural bubbles and zesty flavor.",
        "stock": 75
    },

    # 6. Snacks (4 products)
    {
        "product_name": "Crispy Sea Salt Potato Chips",
        "category": "Snacks",
        "price": 2.99,
        "image_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80",
        "description": "Golden kettle-cooked potato chips seasoned with fine Mediterranean sea salt.",
        "stock": 85
    },
    {
        "product_name": "Chocolate Cream Biscuits",
        "category": "Snacks",
        "price": 2.49,
        "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80",
        "description": "Crunchy cocoa biscuits sandwiched with luscious silky chocolate cream.",
        "stock": 90
    },
    {
        "product_name": "Roasted Salted Mixed Nuts",
        "category": "Snacks",
        "price": 6.49,
        "image_url": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=80",
        "description": "Premium mix of cashews, almonds, pecans and walnuts lightly roasted with sea salt.",
        "stock": 55
    },
    {
        "product_name": "Classic Pretzels Twists",
        "category": "Snacks",
        "price": 2.79,
        "image_url": "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500&auto=format&fit=crop&q=80",
        "description": "Oven-baked crunchy twisted pretzels with a savory sprinkled salt touch.",
        "stock": 70
    },

    # 7. Personal Care (4 products)
    {
        "product_name": "Herbal Nourishing Shampoo",
        "category": "Personal Care",
        "price": 5.99,
        "image_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80",
        "description": "Natural botanic shampoo with aloe vera and argan oil for shiny, healthy hair.",
        "stock": 60
    },
    {
        "product_name": "Silk Repair Hair Conditioner",
        "category": "Personal Care",
        "price": 6.29,
        "image_url": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&auto=format&fit=crop&q=80",
        "description": "Deep hydrating conditioner that detangles and locks in silky smooth moisture.",
        "stock": 55
    },
    {
        "product_name": "Moisturizing Shea Butter Soap (3-Pack)",
        "category": "Personal Care",
        "price": 3.99,
        "image_url": "https://images.unsplash.com/photo-1607006314177-3e5f4d8e87d0?w=500&auto=format&fit=crop&q=80",
        "description": "Gentle cleansing soap bars enriched with organic shea butter and chamomile.",
        "stock": 80
    },
    {
        "product_name": "Fresh Mint Whitening Toothpaste",
        "category": "Personal Care",
        "price": 3.49,
        "image_url": "https://images.unsplash.com/photo-1559591937-e103295982e5?w=500&auto=format&fit=crop&q=80",
        "description": "Fluoride cavity protection toothpaste providing 24-hour cool peppermint breath.",
        "stock": 90
    },

    # 8. Household (4 products)
    {
        "product_name": "Lemon Dishwashing Liquid",
        "category": "Household",
        "price": 3.29,
        "image_url": "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=500&auto=format&fit=crop&q=80",
        "description": "Tough grease-cutting dish detergent with fresh lemon essence and soft skin formula.",
        "stock": 75
    },
    {
        "product_name": "Absorbent Paper Towels (2-Pack)",
        "category": "Household",
        "price": 4.19,
        "image_url": "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=500&auto=format&fit=crop&q=80",
        "description": "Super strong 2-ply kitchen paper towels with fast spill-soaking embossing.",
        "stock": 85
    },
    {
        "product_name": "Antibacterial Surface Cleaner Spray",
        "category": "Household",
        "price": 4.49,
        "image_url": "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80",
        "description": "Multi-surface sanitizing spray killing 99.9% of bacteria without harsh residue.",
        "stock": 65
    },
    {
        "product_name": "Concentrated Laundry Detergent",
        "category": "Household",
        "price": 8.99,
        "image_url": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=80",
        "description": "High-efficiency liquid laundry soap delivering deep fabric stain removal.",
        "stock": 50
    }
]

def seed_database():
    """
    Seeds 32 supermarket products and generates 120+ realistic transactions
    guaranteeing rich association rules via the Apriori algorithm.
    """
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing data cleanly
    cursor.execute("DELETE FROM product_relationships;")
    cursor.execute("DELETE FROM transaction_items;")
    cursor.execute("DELETE FROM transactions;")
    cursor.execute("DELETE FROM products;")
    cursor.execute("DELETE FROM sqlite_sequence;")

    # 1. Insert Products
    product_id_map = {}
    for p in SAMPLE_PRODUCTS:
        cursor.execute("""
        INSERT INTO products (product_name, category, price, image_url, description, stock)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (p["product_name"], p["category"], p["price"], p["image_url"], p["description"], p["stock"]))
        product_id = cursor.lastrowid
        product_id_map[p["product_name"]] = product_id

    print(f"Inserted {len(product_id_map)} supermarket products across 8 categories.")

    # Helper shortcuts for readable transaction baskets
    bananas = product_id_map["Organic Cavendish Bananas"]
    apples = product_id_map["Crisp Royal Gala Apples"]
    oranges = product_id_map["Fresh Sweet Oranges"]
    strawberries = product_id_map["Fresh Farm Strawberries"]

    tomatoes = product_id_map["Vine-Ripened Fresh Tomatoes"]
    onions = product_id_map["Golden Yellow Onions"]
    potatoes = product_id_map["Crisp Russet Potatoes"]
    spinach = product_id_map["Baby Spinach Leaves"]

    milk = product_id_map["Farm Fresh Whole Milk"]
    butter = product_id_map["Creamy Salted Butter"]
    cheese = product_id_map["Aged Cheddar Cheese Block"]
    yogurt = product_id_map["Plain Greek Yogurt"]

    bread = product_id_map["Whole Wheat Artisan Bread"]
    jam = product_id_map["Strawberry Fruit Jam"]
    croissants = product_id_map["Butter Croissants (4-Pack)"]
    muffins = product_id_map["Chocolate Chip Muffins"]

    coffee = product_id_map["Dark Roast Coffee Powder"]
    sugar = product_id_map["Pure Cane Sugar (1kg)"]
    tea = product_id_map["Organic Green Tea Bags"]
    soda = product_id_map["Sparkling Citrus Soda (6-Pack)"]

    chips = product_id_map["Crispy Sea Salt Potato Chips"]
    biscuits = product_id_map["Chocolate Cream Biscuits"]
    nuts = product_id_map["Roasted Salted Mixed Nuts"]
    pretzels = product_id_map["Classic Pretzels Twists"]

    shampoo = product_id_map["Herbal Nourishing Shampoo"]
    conditioner = product_id_map["Silk Repair Hair Conditioner"]
    soap = product_id_map["Moisturizing Shea Butter Soap (3-Pack)"]
    toothpaste = product_id_map["Fresh Mint Whitening Toothpaste"]

    dishwashing = product_id_map["Lemon Dishwashing Liquid"]
    papertowels = product_id_map["Absorbent Paper Towels (2-Pack)"]
    cleaner = product_id_map["Antibacterial Surface Cleaner Spray"]
    detergent = product_id_map["Concentrated Laundry Detergent"]

    # 2. Transaction Patterns (Archetypes with high co-occurrence)
    # Archetype A: Classic Breakfast (Bread, Butter, Jam, Milk, Coffee)
    # Archetype B: Coffee & Sweet Treats (Coffee, Sugar, Milk, Biscuits, Muffins)
    # Archetype C: Fresh Cooking / Dinner Base (Onions, Tomatoes, Potatoes, Spinach)
    # Archetype D: Fruit & Yogurt Healthy Breakfast (Bananas, Strawberries, Yogurt, Apples, Oranges)
    # Archetype E: Movie & Game Night Snacks (Chips, Soda, Pretzels, Nuts)
    # Archetype F: Personal Grooming (Shampoo, Conditioner, Soap, Toothpaste)
    # Archetype G: Kitchen & Cleaning Routine (Dishwashing, Paper Towels, Cleaner, Detergent)
    # Archetype H: Bakery Breakfast (Croissants, Butter, Jam, Coffee)

    baskets_pool = [
        # Pattern 1: Bread + Butter + Jam (Classic high confidence)
        [bread, butter, jam],
        [bread, butter],
        [bread, butter, milk],
        [bread, butter, jam, milk],
        [bread, butter, coffee],
        [bread, jam],
        
        # Pattern 2: Coffee + Sugar + Milk + Biscuits
        [coffee, sugar],
        [coffee, sugar, milk],
        [coffee, milk, biscuits],
        [coffee, sugar, biscuits],
        [coffee, milk, croissants],
        [coffee, muffins],

        # Pattern 3: Milk + Biscuits (High confidence)
        [milk, biscuits],
        [milk, biscuits, apples],
        [milk, bread, biscuits],
        [milk, butter, bread],

        # Pattern 4: Vegetables synergy (Tomatoes + Onions + Potatoes)
        [tomatoes, onions],
        [tomatoes, onions, potatoes],
        [tomatoes, onions, spinach],
        [onions, potatoes],
        [tomatoes, potatoes],

        # Pattern 5: Snacking bundle (Chips + Soda + Pretzels + Nuts)
        [chips, soda],
        [chips, soda, pretzels],
        [chips, soda, nuts],
        [chips, pretzels],
        [soda, pretzels, biscuits],

        # Pattern 6: Hair & Body care (Shampoo + Conditioner + Soap)
        [shampoo, conditioner],
        [shampoo, conditioner, soap],
        [shampoo, conditioner, toothpaste],
        [soap, toothpaste],
        [soap, toothpaste, shampoo],

        # Pattern 7: Household Cleaning (Dishwashing + Paper Towels + Cleaner)
        [dishwashing, papertowels],
        [dishwashing, papertowels, cleaner],
        [dishwashing, cleaner],
        [detergent, papertowels, cleaner],
        [detergent, cleaner],

        # Pattern 8: Healthy Fruit & Yogurt
        [bananas, apples],
        [bananas, strawberries, yogurt],
        [strawberries, yogurt],
        [bananas, apples, oranges],
        [apples, oranges, yogurt],

        # Pattern 9: Cheese & Bread
        [bread, cheese, butter],
        [bread, cheese, tomatoes],
        [croissants, butter, coffee],
        [tea, biscuits, sugar]
    ]

    base_date = datetime.now() - timedelta(days=60)
    total_transactions_to_generate = 135

    random.seed(42)  # Deterministic seed for reproducible evaluation metrics

    for t_idx in range(1, total_transactions_to_generate + 1):
        # Pick a base basket pattern
        core_basket = random.choice(baskets_pool).copy()

        # Occasionally add 1 random everyday item (noise to make rules realistic)
        if random.random() < 0.35:
            extra_item = random.randint(1, len(SAMPLE_PRODUCTS))
            if extra_item not in core_basket:
                core_basket.append(extra_item)

        # Generate realistic date timestamp over the last 60 days
        tx_date = base_date + timedelta(
            days=random.randint(0, 59),
            hours=random.randint(8, 21),
            minutes=random.randint(0, 59)
        )
        tx_date_str = tx_date.strftime("%Y-%m-%d %H:%M:%S")

        # Insert Transaction
        cursor.execute("INSERT INTO transactions (transaction_date, total_amount) VALUES (?, ?);",
                       (tx_date_str, 0.0))
        tx_id = cursor.lastrowid

        total_tx_amount = 0.0
        for item_id in core_basket:
            qty = random.choices([1, 2, 3], weights=[0.75, 0.20, 0.05])[0]
            cursor.execute("""
            INSERT INTO transaction_items (transaction_id, product_id, quantity)
            VALUES (?, ?, ?);
            """, (tx_id, item_id, qty))

            # Fetch price for total
            price_row = cursor.execute("SELECT price FROM products WHERE product_id = ?;", (item_id,)).fetchone()
            if price_row:
                total_tx_amount += price_row['price'] * qty

        cursor.execute("UPDATE transactions SET total_amount = ? WHERE transaction_id = ?;",
                       (round(total_tx_amount, 2), tx_id))

    conn.commit()
    conn.close()

    print(f"Successfully generated {total_transactions_to_generate} realistic transactions.")

    # Run the Apriori algorithm and mine initial rules into the Knowledge Base
    print("Mining initial Association Rules via Apriori algorithm...")
    mining_result = mine_association_rules(min_support=0.03, min_confidence=0.18, min_lift=1.0)
    print("Mining Result:", mining_result)

if __name__ == "__main__":
    seed_database()
