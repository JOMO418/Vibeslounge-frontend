// src/config/api.js

// Get URLs from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// ✅ Export them properly
export { API_URL, SOCKET_URL };

