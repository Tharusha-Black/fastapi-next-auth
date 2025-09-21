// frontend/src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // backend URL
  withCredentials: true, // important: send cookies (refresh_token) automatically
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers!["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;