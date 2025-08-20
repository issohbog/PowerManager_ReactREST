import api from "./axios";

// 현재 이용중 좌석 수와 전체 좌석 수 조회 (관리자 헤더용)  
export const fetchSeatInfo = () => api.get('/seats/count');


// 좌석 현황 조회
export const select = () => api.get('/admin');

// 좌석 상태 변경 (청소중 -> 이용가능)
export const clearSeat = (seatId) => api.post(`/admin/seats/clear/${seatId}`);


