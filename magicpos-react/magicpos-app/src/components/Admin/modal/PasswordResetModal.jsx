import React from 'react';
import styles from '../../css/PasswordResetModal.module.css';

const PasswordResetModal = ({ open, onClose, username, tempPassword }) => {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>비밀번호 초기화 완료</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <p><strong>{username}</strong>님의 초기화된 비밀번호는 다음과 같습니다</p>
          <p className={styles.tempPassword}>{tempPassword}</p>
        </div>
        <div className={styles.modalFooter}>
          <div className={styles.modalFooter.Inner}>
            <button className={styles.btnClose} onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;