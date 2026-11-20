# SmartCart – Intelligent Supermarket Product Recommendation System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build-Vite%205-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![MLxtend](https://img.shields.io/badge/Machine%20Learning-MLxtend%20Apriori-orange.svg?style=flat)](https://rasbt.github.io/mlxtend/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203-003B57.svg?style=flat&logo=sqlite)](https://www.sqlite.org)

> **Problem Statement:**  
> *"A supermarket wants to understand relationships between products frequently purchased together. How can knowledge representation be used to support intelligent product recommendations?"*

---

## 1. Executive Summary & Objective

**SmartCart** is a production-grade, full-stack supermarket web application designed to solve retail cross-selling challenges through **Knowledge Representation (KR)** and **Market Basket Analysis (MBA)**.

Instead of displaying arbitrary or static advertisements, SmartCart analyzes real transaction histories using the **Apriori Association Rule Mining algorithm**. It converts co-occurrence transaction patterns into a structured semantic Knowledge Base:
```
IF Customer purchases Bread
THEN Recommend Butter (Confidence: 92.3%, Lift: 5.42x)
```

The system provides complete dynamic recommendations for both single products and multi-item shopping carts, with fallback to department category companions, accompanied by an interactive **Product Relationship Network Graph** and a complete **Admin Management Dashboard**.

---

## 2. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React Icons |
| **Backend** | Python 3, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite 3 (`smartcart.db`) |
| **Recommendation Engine** | Python, Pandas, MLxtend (`apriori`, `association_rules`) |
| **Knowledge Representation** | Entity-Attribute-Category modeling, Directed Semantic Graphs, Rule Bases |

---

## 3. System Architecture & Knowledge Representation

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT (BROWSER)                                  |
|  - Home Page (Featured & Apriori Showcase)     - Shopping Cart & Dynamic Basket Recs |
|  - 30+ Products Catalog & Search/Filter        - Interactive Knowledge Graph (SVG) |
|  - Product Details & Bundle Deals              - Admin Console (CRUD & Retraining) |
+----------------------------------------+------------------------------------------+
                                         | REST API (JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                             BACKEND ENGINE (FASTAPI)                              |
|  - /products (CRUD)                            - /cart/recommendations            |
|  - /transactions (Checkout & Log)              - /knowledge/relationships         |
|  - /analytics (KPIs & Top Rules)               - /knowledge/retrain (Apriori ML)  |
+----------------------------------------+------------------------------------------+
                                         |
            +----------------------------+----------------------------+
            v                                                         v
+-----------------------+                         +---------------------------------+
|  SQLITE DATABASE      |                         |  RECOMMENDATION & KR ENGINE     |
|  - products           |                         |  - Apriori Frequent Itemsets    |
|  - transactions       |<------------------------|  - Association Rule Mining      |
|  - transaction_items  |                         |  - Support, Confidence, Lift    |
|  - product_rel'ships  |                         |  - Category Companion Fallback  |
+-----------------------+                         +---------------------------------+
```

### Knowledge Representation Principles:
1. **Product Entities:** Individual goods with identity, price, stock, imagery, and description.
2. **Category Taxonomy:** 8 departments (`Fruits`, `Vegetables`, `Dairy`, `Bakery`, `Beverages`, `Snacks`, `Personal Care`, `Household`).
3. **Semantic Association Rules:** Logical implication rules $A \rightarrow B$ where:
   - **Support:** Frequency of basket co-occurrence:
     $$\text{Support}(A \cup B) = \frac{\text{Count}(A \cap B)}{\text{Total Transactions}}$$
   - **Confidence:** Conditional probability that $B$ is bought when $A$ is present:
     $$\text{Confidence}(A \rightarrow B) = \frac{\text{Support}(A \cup B)}{\text{Support}(A)}$$
   - **Lift:** Correlation ratio over independence ($> 1$ denotes true affinity):
     $$\text{Lift}(A \rightarrow B) = \frac{\text{Confidence}(A \rightarrow B)}{\text{Support}(B)}$$
4. **Natural Language Explanations:**
   The inference engine translates quantitative metrics into human-readable customer justifications:
   *"Frequently bought together with Whole Wheat Artisan Bread: 92.3% of customers who bought Bread also purchased Creamy Salted Butter (Lift: 5.42x)."*

---

## 4. Key Pages & Features

### 1. Home Page (`http://localhost:5173`)
- Brand identity with SmartCart logo and active AI status badge.
- Interactive **"Frequently Bought Together" Showcase** demonstrating live Apriori rules.
- 8 category navigation cards with department counts.
- Featured products grid with 1-click cart addition.
- Educational section explaining Support, Confidence, and Lift.

### 2. Products Page (`http://localhost:5173`)
- Complete supermarket catalog of 32 fresh products.
- Instant search bar filtering by name, category, or description.
- Department filter buttons (`All`, `Dairy`, `Bakery`, etc.).
- Price sorting (Low to High, High to Low, Name A-Z).
- In-cart quantity indicators on every card.

### 3. Product Details Page
- High-resolution product showcase with live stock status.
- Quantity selector with total price preview.
- **Smart Bundle Deal:** Automatically pairs the product with its highest-lift complementary item and offers a 10% bundle discount.
- **"Why is this recommended?"** card explaining the Apriori mathematical derivation.
- Related items from the same category department.

### 4. Shopping Cart Page
- Detailed itemized basket table with thumbnail, title, unit price, quantity increment/decrement, and item deletion.
- Real-time price breakdown: Subtotal, 5% Loyalty Discount (orders > $20), Estimated Tax (6%), and Final Total.
- **Dynamic Basket Recommendations:**
  - Evaluates all items in the customer's cart as antecedents.
  - Automatically filters out items already present in the cart.
  - Ranks candidate recommendations by Lift and Confidence.
  - Falls back gracefully to popular department items if rules are sparse.
- **Simulate Checkout & Record Transaction:**
  - Posts to `POST /transactions` to persist the order into SQLite.
  - The newly created transaction immediately expands the dataset for future Apriori re-mining!

### 5. Admin & Analytics Dashboard
- **Product Management:** Complete CRUD operations (Add product modal, Edit product modal, Delete with confirmation).
- **Transaction Logs:** Real-time log of customer receipts and basket contents.
- **Analytics KPIs:** Total Products, Total Baskets, Total Revenue, Average Order Value, and Active AI Rules.
- **Visual Analytics:** Top 10 most purchased products bar chart, category distribution breakdown, and association rules table.
- **Apriori Retraining Console:** Interactive sliders for `Min Support`, `Min Confidence`, and `Min Lift` to re-mine rules on demand with immediate feedback.

### 6. Interactive Knowledge Graph Visualizer
- Force-oriented SVG network diagram.
- Nodes represent products (colored and styled by department).
- Directed edges with arrows represent association rules ($A \rightarrow B$).
- Edge labels display rule Lift factor.
- Click any node to open the side inspector showing all outgoing and incoming recommendation rules.

---

## 5. Database Schema (SQLite)

The SQLite database file is stored at `backend/smartcart.db`:

```sql
-- 1. Products Table
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 50
);

-- 2. Transactions Table
CREATE TABLE transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_date TEXT NOT NULL,
    total_amount REAL DEFAULT 0.0
);

-- 3. Transaction Items Table (Receipt Lines)
CREATE TABLE transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 4. Product Relationships Table (Knowledge Base / Mined Rules)
CREATE TABLE product_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_a INTEGER NOT NULL,
    product_b INTEGER NOT NULL,
    support REAL NOT NULL,
    confidence REAL NOT NULL,
    lift REAL NOT NULL,
    rule_description TEXT,
    last_updated TEXT,
    FOREIGN KEY(product_a) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY(product_b) REFERENCES products(product_id) ON DELETE CASCADE
);
```

---

## 6. REST API Reference

Interactive Swagger documentation is available at **http://localhost:8000/docs**.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List all products with optional `category`, `search`, `sort` |
| `GET` | `/products/{product_id}` | Retrieve details of a single product |
| `POST` | `/products` | Admin: Create a new supermarket product |
| `PUT` | `/products/{product_id}` | Admin: Update an existing product |
| `DELETE` | `/products/{product_id}` | Admin: Delete a product by ID |
| `POST` | `/cart/recommendations` | Apriori recommendations based on cart item IDs |
| `GET` | `/recommendations/{product_id}`| Frequently bought together items for a single product |
| `GET` | `/transactions` | List historical customer checkouts with nested items |
| `POST` | `/transactions` | Checkout endpoint: records order in database |
| `GET` | `/analytics` | Supermarket revenue, top products, category metrics |
| `GET` | `/knowledge/relationships` | Graph format (nodes & edges) for network visualizer |
| `POST` | `/knowledge/retrain` | Triggers Apriori algorithm re-mining on transactions |
| `POST` | `/seed-data` | Resets and seeds 32 products and 135+ transactions |

### Sample Cart Recommendations Payload:
```json
// POST /cart/recommendations
{
  "cart_product_ids": [13],
  "limit": 4
}
```
**Response:**
```json
{
  "recommendations": [
    {
      "product_id": 11,
      "product_name": "Aged Cheddar Cheese Block",
      "category": "Dairy",
      "price": 5.49,
      "score": 155.0,
      "support": 0.0519,
      "confidence": 1.0,
      "lift": 15.0,
      "recommendation_type": "association_rule",
      "trigger_product_name": "Whole Wheat Artisan Bread",
      "explanation": "Frequently bought together with Whole Wheat Artisan Bread: 100.0% of customers who bought Whole Wheat Artisan Bread also purchased Aged Cheddar Cheese Block (Lift: 15.0x)."
    },
    {
      "product_id": 10,
      "product_name": "Creamy Salted Butter",
      "category": "Dairy",
      "price": 4.19,
      "score": 58.82,
      "support": 0.1778,
      "confidence": 0.9231,
      "lift": 5.42,
      "recommendation_type": "association_rule",
      "trigger_product_name": "Whole Wheat Artisan Bread",
      "explanation": "Frequently bought together with Whole Wheat Artisan Bread: 92.3% of customers who bought Whole Wheat Artisan Bread also purchased Creamy Salted Butter (Lift: 5.42x)."
    }
  ],
  "based_on_product_ids": [13],
  "total_recommended": 2
}
```

---

## 7. Project Directory Structure

```
smartcart/
├── backend/
│   ├── database.py         # SQLite connection & schema initialization
│   ├── main.py             # FastAPI REST endpoints & CORS
│   ├── models.py           # Knowledge representation & dataclass ontology
│   ├── recommender.py      # Apriori algorithm & recommendation logic
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── seed_data.py        # 32 products & 135+ realistic transactions
│   ├── requirements.txt    # Python dependencies
│   └── smartcart.db        # SQLite database
│
├── frontend/
│   ├── package.json        # Frontend dependencies & scripts
│   ├── vite.config.js      # Vite build & proxy configuration
│   ├── tailwind.config.js  # Tailwind theme & color setup
│   ├── postcss.config.js   # PostCSS configuration
│   ├── index.html          # HTML entry point
│   └── src/
│       ├── api.js          # Centralized API service
│       ├── App.jsx         # State & navigation coordinator
│       ├── index.css       # Tailwind directives & styles
│       ├── main.jsx        # React root render
│       ├── components/
│       │   ├── Navbar.jsx                   # Sticky navigation & search
│       │   ├── Footer.jsx                   # Project info & tech stack
│       │   ├── ProductCard.jsx              # Product card with quick add
│       │   ├── RecommendationCard.jsx       # Recommendation card with metrics
│       │   └── KnowledgeGraphVisualizer.jsx # Interactive SVG network graph
│       └── pages/
│           ├── HomePage.jsx                 # Hero, categories, Apriori demo
│           ├── ProductsPage.jsx             # 32 products catalog & filter
│           ├── ProductDetailsPage.jsx       # Details, bundle deal, explanation
│           ├── CartPage.jsx                 # Itemized basket & dynamic recs
│           └── AdminDashboard.jsx           # CRUD, analytics, Apriori re-miner
│
├── run_backend.bat         # Windows batch launcher for backend
├── run_backend.ps1         # PowerShell launcher for backend
├── run_frontend.bat        # Windows batch launcher for frontend
├── run_frontend.ps1        # PowerShell launcher for frontend
├── start_all.bat           # 1-click launcher for full-stack application
└── README.md               # Complete documentation
```

---

## 8. Installation & Setup Instructions

### Prerequisites:
- **Python 3.10+** (tested on Python 3.13)
- **Node.js 18+** & **npm**

### Step 1: Open the Project in Visual Studio Code
Open VS Code and navigate to the project directory:
```bash
code .
```

### Step 2: Backend Setup
Open a terminal in VS Code:
```bash
# Navigate to the backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# (Optional) Re-seed sample dataset and mine initial rules
python seed_data.py

# Start FastAPI development server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend will be live at: **http://localhost:8000**  
Interactive Swagger API Docs: **http://localhost:8000/docs**

### Step 3: Frontend Setup
Open a second terminal in VS Code:
```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies (if not already installed)
npm install

# Start Vite React development server
npm run dev
```
Frontend will be live at: **http://localhost:5173**

---

## 9. 1-Click Startup for Windows Users

Double click the included launcher script:
```
start_all.bat
```
This automatically launches the FastAPI backend and Vite frontend in separate terminals and displays the URLs.

---

## 10. College Project Viva & Presentation Questions

### Q1: What is Market Basket Analysis?
**Answer:** Market Basket Analysis is an unsupervised data mining technique that analyzes customer purchase patterns to identify associations between items frequently bought together. It reveals cross-selling opportunities (e.g. customers buying Bread also buy Butter).

### Q2: Why use the Apriori Algorithm?
**Answer:** The Apriori algorithm uses the "Apriori Property" (*all non-empty subsets of a frequent itemset must also be frequent*). This drastically prunes the exponential search space of item combinations, computing frequent itemsets efficiently.

### Q3: What is the difference between Confidence and Lift?
**Answer:**
- **Confidence** ($P(B|A)$) measures how often item $B$ appears in baskets that contain item $A$. However, if item $B$ is universally popular (e.g., Milk), Confidence can be misleadingly high.
- **Lift** normalizes by the baseline popularity of item $B$ ($\text{Confidence}(A \rightarrow B) / \text{Support}(B)$). A Lift greater than 1 proves that items $A$ and $B$ are bought together more often than expected by chance, showing true affinity.

### Q4: How is Knowledge Representation implemented here?
**Answer:** We represent supermarket domain knowledge through:
1. Product Entities with attributes (price, department, stock).
2. Category taxonomies.
3. Logical association rules $\text{IF } A \text{ THEN } B$.
4. Directed semantic graph structures (nodes = products, edges = rules with Support, Confidence, Lift).
5. Dynamic natural language reasoning presented to the shopper.

### Q5: What happens when a customer adds a newly introduced product with no transaction history?
**Answer:** The system uses a **Knowledge-based fallback mechanism**: when association rules for a product have insufficient support, it automatically falls back to department category companions and store best-sellers tagged as `category_fallback`, ensuring the customer always receives relevant suggestions.

---

## 11. License
Developed for educational, research, and project demonstration purposes.
