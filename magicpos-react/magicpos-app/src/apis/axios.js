// apis/axios.js
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  // 로그인/회원가입/토큰발급류는 토큰 미첨부
  const skipAuth = ["/login", "/auth/login", "/users", "/users/new"].some(p =>
    config.url?.endsWith(p)
  );
  if (!skipAuth) {
    const token = localStorage.getItem("jwt");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
