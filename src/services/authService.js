import api from './api';

export const authService = {
  // Login
  login: (email, password) => api.post('/auth/login', { email, password }),

  // Get current user
  getMe: () => api.get('/auth/me'),

  // Logout (client-side only, clears token)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};