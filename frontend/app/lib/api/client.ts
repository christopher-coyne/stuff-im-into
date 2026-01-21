import axios from "axios";
import { Api } from "./api";

const baseURL =
  typeof window === "undefined"
    ? process.env.VITE_API_URL || "http://localhost:3000"
    : import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = new Api({ baseURL });

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Optionally redirect to login
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
