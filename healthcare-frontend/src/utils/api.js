import axios from "axios";

// ✅ FIX: Use relative API path to go through Vite proxy
// In development: /api goes to http://localhost:5000/api (via vite proxy)
// In production: /api goes to same origin
const API_BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Allow credentials for CORS
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/superadmin/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
