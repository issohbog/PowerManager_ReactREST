import api from "./axios";

// 이용권 목록 조회 (관리자, 사용자)
export const fetchTickets = () => api.get('/usertickets/admin/tickets');

// 이용권 등록 전 회원 검색 (관리자)
export const searchUsersForTicket = (keyword) => api.get('/usertickets/admin/usersearch', { params: { keyword } });

// 요금제 결제 (관리자)
export const insertUserTicketByAdmin = (userTicket) => api.post('/usertickets/admin/insert', userTicket);

// 티켓 번호로 티켓 정보 조회 (가격 & 서버 ip 포함, 관리자)
export const fetchTicketInfo = (ticketNo) => api.get(`/usertickets/ticket/${ticketNo}`);

// 이용권 등록 (사용자)
export const insertUserTicket = (userTicket) => api.post('/usertickets/insert', userTicket);

// 결제 정보 반환 (TossPayments 연동, 사용자)
export const fetchPaymentInfo = (params) => api.post('/usertickets/payment-info', params);