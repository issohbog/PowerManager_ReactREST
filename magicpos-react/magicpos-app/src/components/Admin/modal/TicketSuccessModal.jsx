import React, { useEffect } from 'react';
import styles from '../../css/TicketSuccessModal.module.css';

const TicketSuccessModal = ({ open, onClose }) => {

  if (!open) return null;           // open 이 false면 아무것도 랜더링 안함

  useEffect(() => {
    // ESC로 닫기
    const handleKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.checkmarkWrapper}>
          <svg className={styles.checkmark} viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#4f8a8b" strokeWidth="4" />
            <path
              d="M16 27 L24 35 L38 19"
              fill="none"
              stroke="#4f8a8b"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 50,
                strokeDashoffset: 50,
                animation: 'checkmark 0.7s cubic-bezier(0.65,0,0.45,1) forwards',
              }}
            />
          </svg>
        </div>
        <div className={styles.text}>구매가 완료되었습니다!</div>
        <div className={styles.subText}>요금제 결제가 정상적으로 처리되었습니다.</div>
        <button
          className={styles.closeBtn}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default TicketSuccessModal;