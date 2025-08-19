// apis/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// 매 요청에 JWT 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
