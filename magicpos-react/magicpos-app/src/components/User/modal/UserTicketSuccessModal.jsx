// UserTicketSuccessModal.jsx
import React from 'react';
import styles from '../../css/UserTicketSuccessModal.module.css'; 

const UserTicketSuccessModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className={styles.paysuccModalBg}>
      <div className={styles.paysuccModalContent}>
        <div className={styles.paysuccModalBody}>
          <img src="/images/clock.png" alt="성공" className={styles.paysuccModalIcon} />
          <h3 className={styles.paysuccModalBodyTitle}>요금제 구매가 완료되었습니다.</h3>
          <p className={styles.paysuccModalBodyText}>잔여 이용 시간이 추가되었습니다.<br />즐거운 이용 되세요!</p>
        </div>
        <div className={styles.paysuccModalFooter}>
          <button className={styles.paysuccModalFooterBtn} onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default UserTicketSuccessModal;