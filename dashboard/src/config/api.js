// API Configuration for different environments
const config = {
  development: {
    API_BASE_URL: "http://localhost:1337",
  },
  production: {
    API_BASE_URL:
      import.meta.env.VITE_API_URL || "https://your-railway-url.up.railway.app",
  },
};

const environment = import.meta.env.MODE || "development";
export const API_BASE_URL = config[environment].API_BASE_URL;

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
