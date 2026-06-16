import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    // Get token from zustand persisted storage
    try {
      const authData = JSON.parse(localStorage.getItem("auth-storage"));
      const token = authData?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // localStorage not available (SSR) or parse error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors & token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Token expired - try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
        });
        const newToken = res.data?.data?.token;

        if (newToken) {
          // Update stored token
          try {
            const authData = JSON.parse(localStorage.getItem("auth-storage"));
            authData.state.token = newToken;
            localStorage.setItem("auth-storage", JSON.stringify(authData));
          } catch {
            // ignore
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed - logout
        try {
          localStorage.removeItem("auth-storage");
        } catch {
          // ignore
        }
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    // Format error for consistent handling
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
