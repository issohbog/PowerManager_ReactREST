// components/admin/SeatStatus.jsx
import React from 'react'
import styles from '../css/SeatStatus.module.css' // ✅ CSS 모듈 import

const SeatStatus = ({ topSeats, middleSeats, bottomSeats }) => {
    console.log('topSeats:', topSeats) // ✅ 좌석 상태 확인용 로그
    console.log('middleSeats:', middleSeats) // ✅ 좌석 상태 확인용 로그
    console.log('bottomSeats:', bottomSeats) // ✅ 좌석 상태 확인용 로그

  const renderSeats = (seats) =>
    seats.map((seat) => (
      <div
        key={seat.seatId}
        className={`${styles.seat} ${seat.className ? styles[seat.className] : ''}`}
      >
        <div className={styles.seatNumber}>
          {seat.seatName}
          {seat.className === 'broken' ? ' (고장)' : ''}
        </div>

        {seat.username && <div className={styles.memberName}>{seat.username}</div>}

        {seat.className?.includes('in-use') && seat.remainTime && (
          <div className={styles.timeLeft} data-remaining={seat.remainTime}></div>
        )}

        {seat.className === 'cleaning' && (
          <button className={styles.trashIcon} data-seat-id={seat.seatId}>
            <img src="/images/trash.png" alt="휴지통"  />
          </button>
        )}
      </div>
    ))

  return (
    <div className={styles.seatDashboard}>
      <div className={styles.rowContainer}>
        <div className={`${styles.seatRow} ${styles['row-6']}`}>{renderSeats(topSeats)}</div>
        <div className={`${styles.seatRow} ${styles['row-5']}`}>{renderSeats(middleSeats)}</div>
        <div className={`${styles.seatRow} ${styles['row-6']}`}>{renderSeats(bottomSeats)}</div>
        <div className={styles.counter}>카운터</div>
      </div>
    </div>
  )
}

export default SeatStatus
