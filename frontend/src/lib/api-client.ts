import axios from "axios";
import API_URL from "./api-url";
import { getAuthToken, removeAuthToken } from "./utils";

// Configure axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle unauthorized responses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized response received, clearing auth token");
      // Clear the auth token from the client side
      removeAuthToken();

      // Redirect to login page if not already there
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/signin") &&
        !window.location.pathname.includes("/signup")
      ) {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

// Log the base URL to help with debugging
console.log("API Client initialized with baseURL:", API_URL);

export { AxiosError } from "axios";
