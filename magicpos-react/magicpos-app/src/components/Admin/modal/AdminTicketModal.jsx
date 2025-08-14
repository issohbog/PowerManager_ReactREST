import React from 'react'
import styles from '../../css/AdminTicketModal.module.css';

const AdminTicketModal = ({ 
  open, onClose, 
  searchKeyword, setSearchKeyword,
  userSearchResults, userSearchVisible, onUserSelect, selectedUser,
  ticketList, selectedTicket, onTicketSelect,
  selectedPayment, onPaymentSelect,
  onBuy, onInputChange,
  onInputKeyDown,
  focusedIndex
}) => {

  if (!open) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* 모달 헤더 */}
        <div className={styles.adminModalHeader}>
          <h2>요금제 구매</h2>
          <button className={styles.adminCloseBtn} onClick={onClose}>×</button>
        </div>

        {/* 모달 바디 */}
        <div className={styles.adminModalBody}>
          {/* 좌측: 회원검색 + 요금제목록테이블 */}
          <div className={styles.adminTicketLeft}>
            <div className={styles.adminSearchBar}>
              <input 
                type="text" 
                placeholder="회원이름검색"
                value={searchKeyword}
                onChange={onInputChange}
                onKeyDown={onInputKeyDown}
                autoComplete="off"
              />
              <button type="button" className={styles.searchIcon}>
                <img src="/images/search.png" alt="검색버튼" />
              </button>
              {/* 실시간 유저 검색 결과 */}
              {userSearchVisible && !selectedUser && (
                <ul className={styles.adminUserSearchResult}>
                  { userSearchResults.length === 0 
                    ? <li>일치하는 회원이 없습니다</li>
                    : userSearchResults.map((user, idx) => (
                        <li
                          key={user.userNo}
                          onClick={() => onUserSelect(user)}
                          className={idx === focusedIndex ? styles.focused : ''}
                        >
                          {user.username} ({user.userId})
                        </li>
                      ))
                  }
                </ul>
              )}
            </div>

            <table className={styles.adminTicketTable}>
              <thead>
                <tr>
                  <th>요금제</th>
                  <th>제공 시간</th>
                  <th>가격</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ticketList.map(ticket => (
                  <tr key={ticket.no}>
                    <td>{ticket.ticketName}</td>
                    <td>{String(Math.floor(ticket.time / 60)).padStart(2, '0')}:{String(ticket.time % 60).padStart(2, '0')}</td>
                    <td>{ticket.price.toLocaleString()}원</td>
                    <td><button 
                          className={styles.adminAddBtn}
                          onClick={() => onTicketSelect(ticket)}
                          style={selectedTicket?.no === ticket.no ? { background: '#222', color: '#fff' } : {}}
                          >＋
                          </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 우측: 선택 + 결제 */}
          <div className={styles.adminTicketRight}>
            <div className={styles.adminSelectedTicketBox}>
              <div className={styles.adminTicketName}>
                {selectedTicket ? selectedTicket.ticketName : '요금제를 선택하세요'}
              </div>
              <div className={styles.adminTicketInfo}>
                {selectedTicket ? `${selectedTicket.price.toLocaleString()}원 (${String(Math.floor(selectedTicket.time / 60)).padStart(2, '0')}:${String(selectedTicket.time % 60).padStart(2, '0')})` : ''}
              </div>
            </div>
            <div className={styles.adminPayMethods}>
              <button
                className={`${styles.adminPayBtn} ${selectedPayment === 'CASH' ? styles.selected : ''}`}
                data-payment="CASH"
                onClick={() => onPaymentSelect('CASH')}
              >현금</button>
              <button
                className={`${styles.adminPayBtn} ${selectedPayment === 'CARD' ? styles.selected : ''}`}
                data-payment="CARD"
                onClick={() => onPaymentSelect('CARD')}
              >신용카드</button>
            </div>

            <button className={styles.adminConfirmBtn} onClick={onBuy}>결제하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketModal;