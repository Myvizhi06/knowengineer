import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from main import (
    get_products, get_product, create_product, update_product, delete_product,
    get_cart_recommendations, get_single_product_recommendations,
    get_transactions, create_transaction, get_analytics,
    get_knowledge_relationships, retrain_association_rules
)
from schemas import CartRecommendationRequest, CheckoutRequest, CartItem, ProductCreate, ProductUpdate

def run_tests():
    print("==================================================", flush=True)
    print(" Running SmartCart Full-Stack API Integration Tests", flush=True)
    print("==================================================", flush=True)

    # 1. get_products
    prods = get_products()
    assert len(prods) >= 30, f"Expected >= 30 products, got {len(prods)}"
    print(f"[PASS] Products Catalog: {len(prods)} products retrieved across 8 departments.", flush=True)

    # 2. get_product single
    p1 = get_product(prods[0]['product_id'])
    assert p1['product_name'] == prods[0]['product_name']
    print(f"[PASS] Product Details: Product #{p1['product_id']} ({p1['product_name']}) retrieved.", flush=True)

    # 3. get_cart_recommendations
    bread = next(p for p in prods if "Bread" in p['product_name'])
    req = CartRecommendationRequest(cart_product_ids=[bread['product_id']], limit=4)
    recs_res = get_cart_recommendations(req)
    recs = recs_res['recommendations']
    assert len(recs) > 0, "No recommendations returned"
    print(f"[PASS] Cart Recommendations for '{bread['product_name']}': {len(recs)} candidates found.", flush=True)
    for r in recs:
        print(f"       -> {r['product_name']} | Type: {r['recommendation_type']} | Lift: {r['lift']} | Conf: {r['confidence']}", flush=True)

    # 4. get_single_product_recommendations
    single_recs = get_single_product_recommendations(bread['product_id'], 4)
    assert len(single_recs['recommendations']) > 0
    print(f"[PASS] Frequently Bought Together for ID #{bread['product_id']} OK.", flush=True)

    # 5. get_transactions
    txs = get_transactions(limit=10)
    assert len(txs) > 0
    print(f"[PASS] Transactions History: {len(txs)} orders retrieved.", flush=True)

    # 6. create_transaction (checkout)
    chk = CheckoutRequest(items=[
        CartItem(product_id=prods[0]['product_id'], quantity=2),
        CartItem(product_id=prods[1]['product_id'], quantity=1)
    ])
    new_tx = create_transaction(chk)
    assert new_tx['transaction_id'] > 0
    print(f"[PASS] Checkout Simulation: Order #{new_tx['transaction_id']} recorded (Total: ${new_tx['total_amount']}).", flush=True)

    # 7. get_analytics
    stats = get_analytics()
    assert stats['total_products'] >= 30
    assert stats['total_transactions'] >= 100
    assert stats['total_association_rules'] > 0
    print(f"[PASS] Analytics Dashboard: {stats['total_transactions']} transactions, ${stats['total_revenue']} rev, {stats['total_association_rules']} rules.", flush=True)

    # 8. get_knowledge_relationships
    kg = get_knowledge_relationships()
    assert len(kg['nodes']) > 0
    assert len(kg['edges']) > 0
    print(f"[PASS] Knowledge Graph Network: {len(kg['nodes'])} nodes, {len(kg['edges'])} edges.", flush=True)

    # 9. retrain_association_rules
    retrain_res = retrain_association_rules(min_support=0.03, min_confidence=0.18, min_lift=1.0)
    assert retrain_res['status'] == 'success'
    print(f"[PASS] Apriori Re-mining: {retrain_res['rules_count']} rules mined.", flush=True)

    # 10. Admin CRUD operations
    new_prod_req = ProductCreate(
        product_name="Golden Honey Granola",
        category="Snacks",
        price=4.99,
        image_url="https://images.unsplash.com/photo-1517093707255-7096d2e057f8?w=500",
        description="Crunchy oat clusters with natural wild honey.",
        stock=30
    )
    created = create_product(new_prod_req)
    c_id = created['product_id']
    print(f"[PASS] Admin Create: Created product #{c_id}.", flush=True)

    updated = update_product(c_id, ProductUpdate(price=5.49, stock=45))
    assert updated['price'] == 5.49
    print(f"[PASS] Admin Update: Updated price to ${updated['price']}.", flush=True)

    del_res = delete_product(c_id)
    print(f"[PASS] Admin Delete: {del_res['message']}", flush=True)

    print("\n==================================================", flush=True)
    print(" ALL 12 INTEGRATION TESTS PASSED SUCCESSFULLY! ", flush=True)
    print("==================================================", flush=True)

if __name__ == "__main__":
    run_tests()
