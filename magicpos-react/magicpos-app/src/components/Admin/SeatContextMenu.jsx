// components/Admin/SeatContextMenu.jsx
import React from 'react';
import styles from '../css/SeatContextMenu.module.css';

const SeatContextMenu = ({ 
  visible, 
  x, 
  y, 
  seat, 
  onClose, 
  onDailyHistory, 
  onUserInfo, 
  onSendMessage 
}) => {
  if (!visible) return null;

  const handleItemClick = (action) => {
    action();
    onClose();
  };

  return (
    <>
      {/* 배경 클릭 시 닫기 */}
      <div className={styles.overlay} onClick={onClose} />
      
      {/* 컨텍스트 메뉴 */}
      <div 
        className={styles.contextMenu}
        style={{ 
          left: x, 
          top: y,
          position: 'fixed',
          zIndex: 1000
        }}
      >
        <div className={styles.menuHeader}>
          좌석 {seat?.seatId}
          {seat?.username && <span className={styles.username}>({seat.username})</span>}
        </div>
        
        <div className={styles.menuItem} onClick={() => handleItemClick(() => onDailyHistory(seat))}>
          📋 당일 이용 내역
        </div>
        
        {seat?.username && (
          <>
            <div className={styles.menuItem} onClick={() => handleItemClick(() => onUserInfo(seat))}>
              👤 회원 정보 조회
            </div>
            <div className={styles.menuItem} onClick={() => handleItemClick(() => onSendMessage(seat))}>
              💬 메시지 보내기
            </div>
          </>
        )}
        
        {!seat?.username && (
          <div className={styles.menuItemDisabled}>
            사용 중인 회원이 없습니다
          </div>
        )}
      </div>
    </>
  );
};

export default SeatContextMenu;
