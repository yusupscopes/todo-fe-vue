// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
} as const;

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Default configurations for different environments
export const DEFAULT_CONFIGS = {
  development: {
    baseURL: "http://localhost:3000/api/v1",
    timeout: 10000,
  },
  production: {
    baseURL: "https://todo-api-golang.onrender.com/api/v1",
    timeout: 15000,
  },
} as const;
