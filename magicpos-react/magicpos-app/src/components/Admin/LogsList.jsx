import React from 'react';
import '../css/admin_log_list.css';

const LogsList = ({
  // 데이터 props
  logList,
  pagination,
  loading,
  filters,
  
  // 이벤트 핸들러 props
  onFilterChange,
  onSearch,
  onPageChange
}) => {

  // ✅ 날짜 포맷팅 (유틸 함수는 컴포넌트에 유지)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  // ✅ 금액 포맷팅 (유틸 함수는 컴포넌트에 유지)
  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  // ✅ 원래 HTML 구조와 동일하게 페이지네이션 렌더링
  const renderPagination = () => {
    const pages = [];
    
    // 이전 버튼 (원래: th:if="${pagination.page > 1}")
    if (pagination.page > 1) {
      pages.push(
        <li key="prev">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            onPageChange(pagination.page - 1);
          }}>« 이전</a>
        </li>
      );
    }
    
    // 페이지 번호들 (원래: th:each="i : ${#numbers.sequence(pagination.start, pagination.end)}")
    for (let i = pagination.start; i <= pagination.end; i++) {
      pages.push(
        <li key={i} className={i === pagination.page ? 'active' : ''}>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            onPageChange(i);
          }}>
            {i}
          </a>
        </li>
      );
    }
    
    // 다음 버튼 (원래: th:if="${pagination.page < pagination.last}")
    if (pagination.page < pagination.last) {
      pages.push(
        <li key="next">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            onPageChange(pagination.page + 1);
          }}>다음 »</a>
        </li>
      );
    }
    
    return (
      <div className="pagination">  {/* ✅ 원래와 동일한 클래스명 */}
        <ul>  {/* ✅ 원래와 동일한 구조 */}
          {pages}
        </ul>
      </div>
    );
  };

  return (
    <div className="logs-container">
      <div className="content">
        {/* ✅ 검색 필터 영역 */}
        <div className="top-controls">
          <form onSubmit={onSearch} className="search-form">
            <select 
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="admin_category"
            >
              <option value="">전체</option>
              <option value="loginhistory">로그인/로그아웃</option>
              <option value="joinhistory">회원가입</option>
              <option value="tickethistory">이용권 구매</option>
              <option value="orderhistory">상품 구매</option>
            </select>
            
            <div className="search-box">
              <input 
                type="text" 
                value={filters.keyword}
                onChange={(e) => onFilterChange('keyword', e.target.value)}
                placeholder="이름/아이디/좌석번호" 
              />
              <button type="submit" className="search-icon">
                <img src="/images/search.png" alt="검색버튼" />
              </button>
            </div>
            
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
            />
            <span>~</span>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
            />
          </form>
        </div>

        {/* ✅ 로그 테이블 영역 */}
        <div id="logTableArea">
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : (
            <>
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>로그분류</th>
                    <th>이름</th>
                    <th>아이디</th>
                    <th>로그 설명</th>
                    <th>결제금액</th>
                    <th>좌석번호</th>
                    <th>로그시각</th>
                  </tr>
                </thead>
                <tbody>
                  {logList.length > 0 ? (
                    logList.map((log, index) => (
                      <tr key={log.no || index}>
                        <td>{(pagination.page - 1) * pagination.size + index + 1}</td>
                        <td>{log.action_type || log.actionType}</td>
                        <td>{log.username}</td>
                        <td>{log.user_id || log.userId}</td>
                        <td>{log.description}</td>
                        <td>{formatPrice(log.price)}</td>
                        <td>{log.seat_id || log.seatId}</td>
                        <td>{formatDate(log.created_at || log.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ✅ 페이지네이션 - 원래 구조와 동일 */}
              {pagination.last > 1 && renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsList;