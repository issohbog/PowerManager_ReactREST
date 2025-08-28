// apis/axios.js
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  // 로그인/회원가입/토큰발급류는 토큰 미첨부
  const skipAuth = ["/login", "/auth/login", "/users", "/users/new", "/users/check-id", "/users/admin/check-id"].some(p =>
    config.url?.endsWith(p)
  );
  
  console.log(`🔍 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
  
  if (!skipAuth) {
    const token = localStorage.getItem("jwt");
    console.log(`🔑 JWT 토큰 상태: ${token ? '존재함' : '없음'}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ Authorization 헤더 추가됨`);
      
      // JWT 토큰 디코딩해서 권한 확인 (디버깅용)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log(`👤 토큰 정보:`, {
          id: payload.id,           // JwtProvider에서 사용하는 필드명
          username: payload.username, // JwtProvider에서 사용하는 필드명
          roles: payload.rol,        // JwtProvider에서 "rol"로 저장
          exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'undefined'
        });
        console.log(`📋 JWT 페이로드 전체:`, payload);
      } catch (e) {
        console.warn('⚠️ JWT 토큰 디코딩 실패:', e.message);
      }
    } else {
      console.warn('❌ JWT 토큰이 없습니다');
    }
  }
  
  return config;
});

export default api;
