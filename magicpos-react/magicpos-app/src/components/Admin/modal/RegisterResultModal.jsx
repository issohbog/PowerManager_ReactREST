import React from 'react';
import styles from '../../css/RegisterResultModal.module.css';
const RegisterResultModal = ({ open, onClose, result }) => {
  if (!open || !result) return null;

  return (
    <div
      className={styles.modalOverlay}
      style={{ display: open ? 'flex' : 'none' }}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            회원 등록 완료
          </span>
        </div>
        <div className={styles.modalBody}>
          <p>
            <strong>{result.savedUser.username}</strong> 님의 
            <br />
            회원 등록이
            <br />
            완료되었습니다.
          </p>
          <p>
            임시 비밀번호:{' '}
            <span style={{ color: 'red', fontWeight: 'bold' }}>
              {result.savedUser.tempPassword}
            </span>
          </p>
        </div>
        <div className={styles.modalFooter}>
            <div className={styles.modalFooterInner}>
                <button onClick={onClose}>확인</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterResultModal