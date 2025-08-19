import React from 'react';
import styles from '../../css/UserTicketModal.module.css';

const UserTicketModal = ({ open, onClose, ticketList, onSelectTicket, selectedTicket, onPayment }) => {
  if (!open) return null;
  return (
    <div className={styles.ticketModalBg}>
      <div className={styles.ticketModalContent}>
        <span className={styles.ticketModalCloseBtn} onClick={onClose}>&times;</span>
        <div className={styles.ticketCon}>
          <h2>요금제 구매</h2>
          <div className={styles.planGrid}>
            {ticketList && ticketList.map(ticket => (
              <div
                key={ticket.no}
                className={styles.planCard + (selectedTicket && selectedTicket.no === ticket.no ? ' ' + styles.selectedTicket : '')}
                onClick={() => onSelectTicket(ticket)}
              >
                <div className={styles.planTitle}>{`회원 ${ticket.price.toLocaleString()}원권`}</div>
                <div className={styles.planInfo}>
                  <div className={styles.planTime}>{`${ticket.time}:00`}</div>
                  <div className={styles.planPrice}>{`${ticket.price.toLocaleString()}원`}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.ticketModalSide}>
          <div className={styles.ticketSection}>
            <div className={styles.ticketItem}>
              {selectedTicket && (
                <div>
                  <div className={styles.selectTicketName}>{`회원 ${selectedTicket.price.toLocaleString()}원권`}</div>
                  <div>{`${selectedTicket.price.toLocaleString()}원 (${selectedTicket.time}분)`}</div>
                </div>    
              )}
            </div>
          </div>
          <button className={styles.ticketPaymentBtn} type="button" onClick={onPayment}>결제하기</button>
        </div>
      </div>
    </div>
  );
};

export default UserTicketModal;