import React from 'react';
import styles from '../../css/EditResultModal.module.css';

const EditResultModal = ({ open, onClose, result, clearSelectedUserNos }) => {
  if (!open || !result) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>회원 수정 완료</span>
        </div>
        <div className={styles.modalBody}>
          <p>
            <strong>{result.updatedUser?.username || ''}</strong> 님의 회원 정보가 수정되었습니다.
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

export default EditResultModal;