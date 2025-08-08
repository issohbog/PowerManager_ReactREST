import axios from 'axios';

/**
 * 로그 리스트 조회 API
 * @param {Object} params - 검색 조건
 * @param {string} params.keyword - 검색어 (이름/아이디/좌석번호)
 * @param {string} params.type - 로그 타입 (loginhistory, joinhistory, tickethistory, orderhistory)
 * @param {string} params.startDate - 시작 날짜 (yyyy-MM-dd)
 * @param {string} params.endDate - 종료 날짜 (yyyy-MM-dd)
 * @param {number} params.page - 페이지 번호 (기본값: 1)
 * @param {number} params.size - 페이지 크기 (기본값: 10)
 * @returns {Promise} axios response
 */
export const getLogList = (params = {}) => {
  console.log('📤 로그 API 호출:', params);
  
  // 빈 값 제거
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      cleanParams[key] = params[key];
    }
  });
  
  console.log('🔍 정리된 파라미터:', cleanParams);
  
  return axios.get('/admin/logs/logList', {
    params: cleanParams
  });
};

/**
 * 로그 타입별 조회 (편의 함수들)
 */

// 전체 로그 조회
export const getAllLogs = (startDate, endDate, page = 1, size = 10, keyword = '') => {
  return getLogList({
    startDate,
    endDate,
    page,
    size,
    keyword
  });
};

// 로그인/로그아웃 로그 조회
export const getLoginLogs = (startDate, endDate, page = 1, size = 10, keyword = '') => {
  return getLogList({
    type: 'loginhistory',
    startDate,
    endDate,
    page,
    size,
    keyword
  });
};

// 회원가입 로그 조회
export const getJoinLogs = (startDate, endDate, page = 1, size = 10, keyword = '') => {
  return getLogList({
    type: 'joinhistory',
    startDate,
    endDate,
    page,
    size,
    keyword
  });
};

// 이용권 구매 로그 조회
export const getTicketLogs = (startDate, endDate, page = 1, size = 10, keyword = '') => {
  return getLogList({
    type: 'tickethistory',
    startDate,
    endDate,
    page,
    size,
    keyword
  });
};

// 상품 구매 로그 조회
export const getOrderLogs = (startDate, endDate, page = 1, size = 10, keyword = '') => {
  return getLogList({
    type: 'orderhistory',
    startDate,
    endDate,
    page,
    size,
    keyword
  });
};