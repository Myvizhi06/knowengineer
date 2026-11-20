// API client configuration
const BASE_URL = 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Product endpoints
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    const queryString = query.toString();
    return request(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProduct: (id) => request(`/products/${id}`),

  createProduct: (data) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id, data) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Recommendation endpoints
  getCartRecommendations: (cartProductIds, limit = 4) =>
    request('/cart/recommendations', {
      method: 'POST',
      body: JSON.stringify({ cart_product_ids: cartProductIds, limit }),
    }),

  getProductRecommendations: (productId, limit = 4) =>
    request(`/recommendations/${productId}?limit=${limit}`),

  // Transactions
  getTransactions: (limit = 50, offset = 0) =>
    request(`/transactions?limit=${limit}&offset=${offset}`),

  createTransaction: (items) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  // Analytics & Knowledge Representation
  getAnalytics: () => request('/analytics'),

  getKnowledgeRelationships: () => request('/knowledge/relationships'),

  retrainRules: (minSupport = 0.02, minConfidence = 0.15, minLift = 1.0) =>
    request(`/knowledge/retrain?min_support=${minSupport}&min_confidence=${minConfidence}&min_lift=${minLift}`, {
      method: 'POST',
    }),

  seedDatabase: () =>
    request('/seed-data', {
      method: 'POST',
    }),
};
