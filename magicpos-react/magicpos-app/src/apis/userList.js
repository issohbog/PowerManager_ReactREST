import api from "./axios";

// 사용자 목록 조회
export const fetchUsers = (params) => api.get('/users/admin/userlist', { params });        

// 사용자 등록
export const saveUser = (userData) => api.post('/users/admin/save', userData);

// 사용자 정보 수정 
export const updateUser = (userData) => api.put('/users/admin/update', userData);

// 사용자 단건 삭제
export const deleteUser = (no) => api.delete(`/users/admin/${no}/delete`);

// 사용자 다건 삭제
export const deleteUsers = (userNos) => api.delete('/users/admin/deleteAll', { data: userNos });

// 사용자 아이디 중복 확인
export const checkUserId = (userId) => api.get(`/users/admin/check-id`, { params: { id: userId } });

// 사용자 비밀번호 초기화 
export const resetUserPassword = (no) => api.put(`/users/admin/${no}/reset`);