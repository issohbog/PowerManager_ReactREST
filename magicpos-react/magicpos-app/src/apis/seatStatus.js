import api from "./axios";

// 좌석 현황 조회
export const select = () => api.get('/admin');