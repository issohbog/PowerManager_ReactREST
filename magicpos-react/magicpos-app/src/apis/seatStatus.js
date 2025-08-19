import axios from 'axios'
axios.defaults.baseURL = "/api"

// 현재 이용중 좌석 수와 전체 좌석 수 조회 (관리자 헤더용)  
export const fetchSeatInfo = () => axios.get('/seats/count');


// 좌석 현황 조회
export const select = () => axios.get('/admin');

// 좌석 상태 변경 (청소중 -> 이용가능)
export const clearSeat = (seatId) => axios.post(`/admin/seats/clear/${seatId}`);