import api from './api';

export const productService = {
  // Get all products
  getAll: () => api.get('/products'),

  // Get single product
  getById: (id) => api.get(`/products/${id}`),

  // Create product (admin only)
  create: (productData) => api.post('/products', productData),

  // Update product (admin only)
  update: (id, productData) => api.put(`/products/${id}`, productData),

  // Delete product (admin only)
  delete: (id) => api.delete(`/products/${id}`),

  // Get low stock products
  getLowStock: () => api.get('/products/low-stock'),
};

export default productService;