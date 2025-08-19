import api from "./axios";

// 회원가입
export const join = (data) => api.post(`/users`, data)

// 로그인
export const login = (username, password, seatId) => {
  return api.post("/login", { username, password, seatId });
};

// 회원 정보
export const info = () => api.get(`/users/info`)