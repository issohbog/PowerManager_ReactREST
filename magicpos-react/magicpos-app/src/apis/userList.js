import axios from "axios";
axios.defaults.baseURL = "/api";

// 사용자 목록 조회
export const fetchUsers = (params) => axios.get('/users/admin/userlist', { params });        

// 사용자 등록
export const saveUser = (userData) => axios.post('/users/admin/save', userData);

// 사용자 정보 수정 
export const updateUser = (userData) => axios.put('/users/admin/update', userData);

// 사용자 단건 삭제
export const deleteUser = (no) => axios.delete(`/users/admin/${no}/delete`);

// 사용자 다건 삭제
export const deleteUsers = (userNos) => axios.delete('/users/admin/deleteAll', { data: userNos });

// 사용자 아이디 중복 확인
export const checkUserId = (userId) => axios.get(`/users/admin/check-id`, { params: { id: userId } });

// 사용자 비밀번호 초기화 
export const resetUserPassword = (no) => axios.put(`/users/admin/${no}/reset`);