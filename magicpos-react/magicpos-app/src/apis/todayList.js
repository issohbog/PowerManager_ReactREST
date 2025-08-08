import axios from 'axios';

/**
 * 당일내역 리스트 조회 API
 * @param {Object} params - 검색 조건
 * @param {string} params.keyword - 검색어 (내역명/이름/아이디)
 * @param {string} params.type - 내역 타입 (orderhistory, tickethistory)
 * @param {number} params.page - 페이지 번호 (기본값: 1)
 * @param {number} params.size - 페이지 크기 (기본값: 10)
 * @returns {Promise} axios response
 */
export const getTodayList = (params = {}) => {
  console.log('📤 당일내역 API 호출:', params);
  
  // 빈 값 제거
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      cleanParams[key] = params[key];
    }
  });
  
  console.log('🔍 정리된 파라미터:', cleanParams);
  
  return axios.get('/admin/history/today', {
    params: cleanParams
  });
};

/**
 * 타입별 조회 (편의 함수들)
 */

// 전체 당일내역 조회
export const getAllTodayList = (page = 1, size = 10, keyword = '') => {
  return getTodayList({
    page,
    size,
    keyword
  });
};

// 주문 내역만 조회
export const getOrderHistory = (page = 1, size = 10, keyword = '') => {
  return getTodayList({
    type: 'orderhistory',
    page,
    size,
    keyword
  });
};

// 이용권 내역만 조회
export const getTicketHistory = (page = 1, size = 10, keyword = '') => {
  return getTodayList({
    type: 'tickethistory',
    page,
    size,
    keyword
  });
};