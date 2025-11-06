import api from './api';

export const salesService = {
  // Create a sale
  createSale: (saleData) => api.post('/sales', saleData),

  // ✅ Corrected route: get today's profit
  getTodayProfit: () => api.get('/sales/today/profit'),

  // ✅ Corrected route: get manager’s sales today
  getMySalesToday: () => api.get('/sales/today/my-sales'),

  // Get all sales (admin)
  getAllSales: (params) => api.get('/sales/all', { params }),

  // Get sales analytics
  getAnalytics: (params) => api.get('/sales/analytics', { params }),

deleteSale: (id) => api.delete(`/sales/${id}`),

  // ❌ REMOVE (not defined in backend)
  // getBestSellers: (params) => api.get('/sales/best-sellers', { params }),
};