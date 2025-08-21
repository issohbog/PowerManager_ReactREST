import React, { useEffect, useState } from 'react'
import styles from '../../css/SelectSeat.module.css' // ✅ CSS 모듈 import

const SelectSeat = ({ topSeats, middleSeats, bottomSeats, onClose, setSeatId }) => {
    console.log('topSeats:', topSeats) // ✅ 좌석 상태 확인용 로그
    console.log('middleSeats:', middleSeats) // ✅ 좌석 상태 확인용 로그
    console.log('bottomSeats:', bottomSeats) // ✅ 좌석 상태 확인용 로그

  function formatRemainTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const SeatTimeLeft = ({ initialMinutes }) => {

    const [remaining, setRemaining] = useState(initialMinutes * 60);
    useEffect(() => {
      if (remaining <= 0 ) return; 
      const timer = setInterval(() => {
        setRemaining(prev => (prev > 0 ? prev - 1 : 0))
      }, 1000)

      return () => clearInterval(timer)
    }, [remaining]);

    if (remaining <= 0) {
      return <div>만료됨</div>;
    }
    return <div className={styles.timeLeft}>{formatRemainTime(remaining)} 남음</div>;

  };

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

        <button 
          className={styles.selectSeatButton}
          onClick={() => {
          setSeatId(seat.seatId); // 부모 seatId 갱신
          onClose(); // 모달 닫기
        }}>
          좌석 선택
        </button>

        {seat.username && <div className={styles.memberName}>사용중</div>}

        {seat.className?.includes('in-use') && seat.remainTime && (
          <SeatTimeLeft initialMinutes={seat.remainTime} />
          // <div className={styles.timeLeft} data-remaining={seat.remainTime}></div>
        )}

        {seat.className === 'cleaning' && (
          <button 
            className={styles.trashIcon} 
            data-seat-id={seat.seatId}
            >
            <img src="/images/trash.png" alt="휴지통"  />
          </button>
        )}

      </div>
    ))

  return (
    <div className={styles.seatDashboard}>
      <div className={styles.selectseatheader}>
        <div className={styles.title}>좌석 현황</div>
        <button className={styles.closeButton} onClick={onClose}>X</button>
      </div>
      <div className={styles.rowContainer}>
        <div className={`${styles.seatRow} ${styles['row-6']}`}>{renderSeats(topSeats)}</div>
        <div className={`${styles.seatRow} ${styles['row-5']}`}>{renderSeats(middleSeats)}</div>
        <div className={`${styles.seatRow} ${styles['row-6']}`}>{renderSeats(bottomSeats)}</div>
        <div className={styles.counter}>카운터</div>
      </div>
    </div>
  )
}

export default SelectSeat
