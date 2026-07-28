import axios from "axios";

const API_URL = "http://localhost:8080/api";
// const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Maybe redirect to login...");
      // Optionally, you can clear localStorage or perform other actions here
      console.log(error.response);
    }
    return Promise.reject(error);
  },
);

export default api;
