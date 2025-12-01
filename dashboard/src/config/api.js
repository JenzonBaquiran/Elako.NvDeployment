// API Configuration - Use Vite environment variable first, then fallback to config
const config = {
  development: {
    API_BASE_URL: "http://localhost:1337",
  },
  production: {
    API_BASE_URL: "https://elakonvdeployment-production.up.railway.app",
  },
};

const environment = import.meta.env.MODE || "production";

// Use Vite env variable first, then fallback to config, with final fallback to production URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  config[environment]?.API_BASE_URL ||
  "https://elakonvdeployment-production.up.railway.app";

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return response;
};
