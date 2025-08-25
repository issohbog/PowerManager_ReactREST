import api from "./axios";

// 회원가입
export const join = (data) => api.post(`/users/signup`, data)

// 아이디 중복 확인 (일반 사용자용 엔드포인트 사용)
export const checkId = (id) => api.get('/users/check-id', { params: { id } })

// 로그인
export const login = (username, password, seatId) => {
  return api.post("/login", { username, password, seatId });
};

// 회원 정보
export const info = () => api.get(`/users/info`)





