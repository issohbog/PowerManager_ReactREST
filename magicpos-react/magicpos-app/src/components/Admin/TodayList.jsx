import React from 'react';
import styles from '../css/TodayList.module.css';
import Pagination from './Pagination';

const TodayList = ({
  // 데이터 props
  todayList,
  pagination,
  loading,
  filters,
  
  // 이벤트 핸들러 props
  onFilterChange,
  onSearch,
  onPageChange
}) => {

  // ✅ 날짜 포맷팅
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

  // ✅ 금액 포맷팅
  const formatPrice = (price) => {
    if (!price) return '0원';
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };


  return (
    <div className={styles.todayContainer}>
      <div className={styles.content}>
        {/* ✅ 검색 필터 영역 */}
        <div className={styles.topControls}>
          <form onSubmit={onSearch} className={styles.searchForm}>
            <select 
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className={styles.adminCategory}
              id="typeSelect"
            >
              <option value="">전체</option>
              <option value="orderhistory">주문</option>
              <option value="tickethistory">이용권</option>
            </select>
            
            <div className={styles.searchBox}>
              <input 
                type="text" 
                value={filters.keyword}
                onChange={(e) => onFilterChange('keyword', e.target.value)}
                placeholder="내역명/이름/아이디" 
              />
              <button type="submit" className={styles.searchIcon}>
                <img src="/images/search.png" alt="검색버튼" />
              </button>
            </div>
          </form>
        </div>

        {/* ✅ 당일내역 테이블 영역 */}
        <div id={styles.todayTableArea}>
          {loading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : (
            <>
              <table className={styles.todayTable}>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>내역분류</th>
                    <th>내역명</th>
                    <th>이름</th>
                    <th>아이디</th>
                    <th>좌석번호</th>
                    <th>결제금액</th>
                    <th>결제시각</th>
                  </tr>
                </thead>
                <tbody>
                  {todayList.length > 0 ? (
                    todayList.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{(pagination.page - 1) * pagination.size + index + 1}</td>
                        <td>{item.history_type || item.historyType}</td>
                        <td>{item.item_name || item.itemName}</td>
                        <td>{item.username}</td>
                        <td>{item.user_id || item.userId}</td>
                        <td>{item.seat_id || item.seatId}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{formatDate(item.time || item.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className={styles.noData}>
                        당일 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ✅ 페이지네이션 - 원래 구조 */}
              <Pagination pagination={pagination} onPageChange={onPageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayList;