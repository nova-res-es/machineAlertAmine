// general api config
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `https://novares-machine-alert.onrender.com/`,
  timeout: 60000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);



// Enhanced API request function with retry mechanism
export const apiRequest = async (method, url, data = null, isFormData = false, queryParams = {}) => {

 
    try {
      // Get token from localStorage
      const token = localStorage.getItem("accessToken")

      const config = {
        method,
        url,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
        ...(method.toUpperCase() !== "GET" && data ? { data } : {}),
        ...(method.toUpperCase() === "GET" && Object.keys(queryParams).length > 0 ? { params: queryParams } : {}),
      }

      const response = await axiosInstance(config)
      return response.data
    } catch (error) {
      console.error("API request error:", error)
    throw error
    }
  }

export default axiosInstance
