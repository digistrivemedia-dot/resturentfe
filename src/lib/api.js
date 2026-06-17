import axios from "axios";
import { getToken, setToken, clearToken } from "@/lib/tokenManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // send/receive cookies (refreshToken, userRole, userInfo)
  headers: { "Content-Type": "application/json" },
});

// Attach access token from memory (tokenManager) — no localStorage, no circular dep
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401: try to refresh access token once, then give up
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Use raw axios (not api) to avoid interceptor loop
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data?.data?.token;
        if (newToken) {
          setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed — token/cookie invalid or expired
        clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject({ message, status: error.response?.status, data: error.response?.data });
  }
);

export default api;
