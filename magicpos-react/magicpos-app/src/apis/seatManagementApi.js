// apis/seatManagementApi.js - 좌석 관리 API 호출 함수들

import api from "./axios";

// ========== 분단 관리 API ==========

// 모든 분단 조회
export const getAllSections = () => api.get('/seat-sections');

// 분단 생성
export const createSection = (sectionData) => api.post('/seat-sections', sectionData);

// 분단 수정
export const updateSection = (sectionNo, sectionData) => api.put(`/seat-sections/${sectionNo}`, sectionData);

// 분단 삭제
export const deleteSection = (sectionNo) => api.delete(`/seat-sections/${sectionNo}`);

// 분단 순서 변경
export const updateSectionOrder = (sectionNo, sectionOrder) => api.put(`/seat-sections/${sectionNo}/order`, { sectionOrder });

// 분단 개수 자동 조정
export const adjustSectionCount = (targetCount) => api.put(`/seat-sections/adjust/${targetCount}`);

// ========== 좌석 매핑 API ==========

// 전체 좌석 배치 조회
export const getAllMappings = () => api.get('/seat-mappings');

// 분단별 좌석 조회
export const getMappingsBySection = (sectionNo) => api.get(`/seat-mappings/section/${sectionNo}`);

// 좌석 위치 업데이트 (드래그 앤 드롭)
export const updateSeatPosition = (seatId, positionX, positionY) => api.put(`/seat-mappings/seat/${seatId}/position`, { positionX, positionY });

// 좌석 분단 변경
export const moveSeatToSection = (seatId, sectionNo) => api.put(`/seat-mappings/seat/${seatId}/section`, { sectionNo });

// 좌석 매핑 생성
export const createMapping = (mappingData) => api.post('/seat-mappings', mappingData);

// 좌석 매핑 삭제
export const deleteMapping = (seatId) => api.delete(`/seat-mappings/seat/${seatId}`);

// 전체 레이아웃 일괄 저장 (가장 중요한 API)
export const saveLayout = (mappings) => api.post('/seat-mappings/layout', mappings);

// 매핑되지 않은 좌석 조회
export const getUnmappedSeats = () => api.get('/seat-mappings/unmapped');

// 분단별 좌석 개수 조회
export const getSeatCountBySection = (sectionNo) => api.get(`/seat-mappings/section/${sectionNo}/count`);

// ========== 좌석 정보 조회 API ==========

// 전체 좌석 정보 조회 (기존 SeatController 활용)
export const getAllSeats = () => api.get('/admin');

// 좌석 상태 변경 (새로운 API 엔드포인트)
export const updateSeatStatus = (seatId, status) => api.post(`/admin/seats/${seatId}/status`, { status });

// ========== 좌석 생성/삭제 API ==========

// 새 좌석 생성
export const createSeat = (seatData) => api.post('/seats/add', seatData);

// 좌석 삭제
export const deleteSeat = (seatId) => api.delete(`/seats/remove/${seatId}`);

// ========== 그룹 범위 관리 API ==========

// 그룹 번호 범위 업데이트 (seat_section_mappings 테이블의 section_no 업데이트)
export const updateGroupRanges = (groupRanges) => api.post('/admin/groups/update-ranges', groupRanges);

// 그룹별 실제 좌석 범위 조회 (DB에서 현재 범위 가져오기)
export const getGroupRanges = () => api.get('/admin/groups/ranges');
