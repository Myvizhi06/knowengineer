"""
SmartCart Data Models & Knowledge Representation Ontology
-----------------------------------------------------------
This module defines the relational schema mapping and the Knowledge Representation
conceptual models for the Supermarket Recommendation System.

Knowledge Representation Concepts:
1. Product Entities:
   - Unique identifier, name, category, price, imagery, description.
2. Conceptual Taxonomy:
   - Belongs-To category relationships (Dairy, Bakery, Beverages, Snacks, etc.)
3. Association Rules / Knowledge Rules:
   - IF Antecedent (Product A) THEN Consequent (Product B)
   - Metrics: Support (P(A ∩ B)), Confidence (P(B|A)), Lift (P(B|A) / P(B))
4. Transaction Basket Instance:
   - Co-occurrence instances recorded in real customer checkouts.
"""

from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ProductEntity:
    product_id: int
    product_name: str
    category: str
    price: float
    image_url: str
    description: str
    stock: int

@dataclass
class KnowledgeRule:
    rule_id: int
    antecedent_id: int
    consequent_id: int
    support: float
    confidence: float
    lift: float
    rule_description: str
    last_updated: str

    def to_semantic_clause(self) -> str:
        return f"Rule: IF [Product #{self.antecedent_id}] THEN [Product #{self.consequent_id}] (Lift: {self.lift:.2f}, Conf: {self.confidence:.2%})"
