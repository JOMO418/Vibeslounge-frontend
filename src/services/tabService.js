import api from './api';

export const tabService = {
  // Get all tabs
  getAll: () => api.get('/tabs'),

  // Create new tab
  create: (tabData) => api.post('/tabs', tabData),

  // Record payment
  recordPayment: (tabId, paymentData) => api.put(`/tabs/${tabId}/payment`, paymentData),

  // Update tab
  update: (tabId, tabData) => api.put(`/tabs/${tabId}`, tabData),

  // Delete tab
  delete: (tabId) => api.delete(`/tabs/${tabId}`),
};

