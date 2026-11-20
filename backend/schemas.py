from typing import List, Optional
from pydantic import BaseModel, Field

# Product Schemas
class ProductBase(BaseModel):
    product_name: str
    category: str
    price: float = Field(..., gt=0, description="Product price in currency units")
    image_url: str
    description: Optional[str] = ""
    stock: Optional[int] = 50

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = None

class ProductResponse(ProductBase):
    product_id: int

# Transaction Schemas
class CartItem(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)

class CheckoutRequest(BaseModel):
    items: List[CartItem]

class TransactionItemDetail(BaseModel):
    product_id: int
    product_name: str
    category: str
    price: float
    quantity: int
    subtotal: float

class TransactionResponse(BaseModel):
    transaction_id: int
    transaction_date: str
    total_amount: float
    item_count: int
    items: List[TransactionItemDetail]

# Recommendation Schemas
class CartRecommendationRequest(BaseModel):
    cart_product_ids: List[int]
    limit: Optional[int] = 4

class RecommendationItem(BaseModel):
    product_id: int
    product_name: str
    category: str
    price: float
    image_url: str
    description: Optional[str]
    score: float
    support: Optional[float] = None
    confidence: Optional[float] = None
    lift: Optional[float] = None
    recommendation_type: str  # "association_rule" or "category_fallback"
    trigger_product_name: Optional[str] = None
    explanation: str

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    based_on_product_ids: List[int]
    total_recommended: int

# Knowledge Graph / Relationship Schemas
class GraphNode(BaseModel):
    id: int
    label: str
    category: str
    price: float
    image_url: str
    size: int = 25

class GraphEdge(BaseModel):
    id: str
    from_node: int = Field(..., alias="from")
    to_node: int = Field(..., alias="to")
    support: float
    confidence: float
    lift: float
    label: str
    arrows: str = "to"

    class Config:
        populate_by_name = True

class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_rules: int
    categories: List[str]

# Analytics Schemas
class ProductPurchaseStat(BaseModel):
    product_id: int
    product_name: str
    category: str
    purchase_count: int
    total_revenue: float

class TopRuleStat(BaseModel):
    rule_id: int
    antecedent: str
    consequent: str
    support: float
    confidence: float
    lift: float
    explanation: str

class AnalyticsResponse(BaseModel):
    total_products: int
    total_transactions: int
    total_revenue: float
    average_order_value: float
    total_association_rules: int
    top_products: List[ProductPurchaseStat]
    top_rules: List[TopRuleStat]
    category_distribution: dict
