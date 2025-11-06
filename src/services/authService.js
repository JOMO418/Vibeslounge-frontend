import axios from 'axios';
import { API_URL } from '../config/api'; // ✅ correct import

// Create axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // ✅ Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  
  // ✅ Register (Admin only)
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // ✅ Get current user
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  // ✅ Get all users (Admin only)
  getAllUsers: async () => {
    return await api.get('/auth/users');
  },

  // ✅ Update user (Admin only)
  updateUser: async (userId, userData) => {
    const updateData = { ...userData };
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }
    return await api.put(`/auth/users/${userId}`, updateData);
  },

  // ✅ Delete user (Admin only)
  deleteUser: async (userId) => {
    return await api.delete(`/auth/users/${userId}`);
  },

  // ✅ Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService;
