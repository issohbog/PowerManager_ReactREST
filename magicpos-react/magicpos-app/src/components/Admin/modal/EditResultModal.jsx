import React, { useEffect, useState } from 'react';
import styles from '../../css/EditResultModal.module.css';
import modalAnimation from '../../css/ModalAnimation.module.css';
const EditResultModal = ({ open, onClose, result}) => {

  // 모달 fadeIn, fadeOut 적용 
  const [show, setShow] = useState(open);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (open) {
      setShow(true);
      setAnimClass(modalAnimation.fadeIn);
    } else if (show) {
      setAnimClass(modalAnimation.fadeOut);
      // fadeOut 애니메이션 끝나면 완전히 unmount
      const timer = setTimeout(() => setShow(false), 300); // 300ms는 애니메이션 시간과 맞춰주세요
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!show || !result) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${animClass}`}>
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