import api from './api';

export const salesService = {
  // Create a sale
  createSale: (saleData) => api.post('/sales', saleData),

  // Get today's profit
  getTodayProfit: () => api.get('/sales/today/profit'),

  // Get my sales today (manager)
  getMySalesToday: () => api.get('/sales/today/my-sales'),

  // Get all sales (admin)
  getAllSales: (params) => api.get('/sales/all', { params }),

  // Get sales analytics
  getAnalytics: (params) => api.get('/sales/analytics', { params }),

  // Get best sellers
  getBestSellers: (params) => api.get('/sales/best-sellers', { params }),
};