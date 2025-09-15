import React, { useEffect, useState } from 'react';
import styles from '../../css/PasswordResetModal.module.css';
import modalAnimation from '../../css/ModalAnimation.module.css'

const PasswordResetModal = ({ open, onClose, username, tempPassword }) => {

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

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${animClass}`}>
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