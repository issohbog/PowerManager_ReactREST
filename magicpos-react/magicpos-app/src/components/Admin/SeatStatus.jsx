// components/admin/SeatStatus.jsx
import React, { useEffect, useState } from 'react'
import styles from '../css/SeatStatus.module.css' // ✅ CSS 모듈 import
import SeatContextMenu from './SeatContextMenu'
import UserInfoModal from './modal/UserInfoModal'
import DailyHistoryModal from './modal/DailyHistoryModal'
import { getUserInfo, getSeatUsageInfo, getSeatTodayHistory  } from '../../apis/seatStatus'

const SeatStatus = ({ topSeats, middleSeats, bottomSeats, onChangeSeatStatus }) => {
    console.log('topSeats:', topSeats) // ✅ 좌석 상태 확인용 로그
    console.log('middleSeats:', middleSeats) // ✅ 좌석 상태 확인용 로그
    console.log('bottomSeats:', bottomSeats) // ✅ 좌석 상태 확인용 로그

  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    seat: null
  });

  // 회원 정보 모달 상태
  const [userInfoModal, setUserInfoModal] = useState({
    visible: false,
    userInfo: null
  });

  // 당일 내역 모달 상태
  const [dailyHistoryModal, setDailyHistoryModal] = useState({
    visible: false,
    seatId: '',
    historyData: null
  });

  // 우클릭 이벤트 핸들러
  const handleContextMenu = (e, seat) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      seat: seat
    })
  }

  // 컨텍스트 메뉴 닫기
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, seat: null })
  }

  // 전역 클릭 이벤트로 컨텍스트 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        closeContextMenu()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [contextMenu.visible])

  // 메뉴 항목 클릭 핸들러들
  const handleDailyHistory = async (seat) => {
    console.log('당일 이용 내역 조회:', seat)
    
    // 방어 코드: seat 객체 및 seatId 검증
    if (!seat || !seat.seatId) {
      console.error('좌석 정보가 올바르지 않습니다:', seat)
      alert('좌석 정보를 찾을 수 없습니다.')
      closeContextMenu()
      return
    }
    
    try {
      const response = await getSeatTodayHistory(seat.seatId)
      const historyData = response.data
      
      console.log('당일 이용 내역:', historyData)
      
      if (historyData.success) {
        // 당일 내역 모달 표시
        setDailyHistoryModal({
          visible: true,
          seatId: seat.seatId,
          historyData: historyData
        })
      } else {
        alert('당일 이용 내역을 조회할 수 없습니다.')
      }
    } catch (error) {
      console.error('당일 이용 내역 조회 중 오류 발생:', error)
      alert('당일 이용 내역을 조회하는데 문제가 발생했습니다.')
    }
    
    closeContextMenu()
  }

  const handleUserInfo = async (seat) => {
    console.log('회원 정보 조회:', seat)
    
    // 방어 코드: seat 객체 및 seatId 검증
    if (!seat || !seat.seatId) {
      console.error('좌석 정보가 올바르지 않습니다:', seat)
      alert('좌석 정보를 찾을 수 없습니다.')
      closeContextMenu()
      return
    }
    
    try {
      // 1. 좌석 사용 정보를 조회하여 사용자 번호를 얻습니다
      const seatUsageResponse = await getSeatUsageInfo(seat.seatId)
      const seatUsageData = seatUsageResponse.data
      
      console.log('좌석 사용 정보:', seatUsageData)
      
      if (!seatUsageData.user_no) {
        alert('현재 사용 중인 회원이 없습니다.')
        closeContextMenu()
        return
      }
      
      // 2. 사용자 번호로 회원 정보를 조회합니다
      const userInfoResponse = await getUserInfo(seatUsageData.user_no)
      const userInfoData = userInfoResponse.data
      
      console.log('회원 정보 조회 결과:', userInfoData)
      
      // 3. 회원 정보 모달을 표시합니다
      setUserInfoModal({
        visible: true,
        userInfo: userInfoData
      })
      
    } catch (error) {
      console.error('회원 정보 조회 중 오류 발생:', error)
      alert('회원 정보를 조회할 수 없습니다.')
    }
    
    closeContextMenu()
  }

  const handleSendMessage = (seat) => {
    console.log('메시지 보내기:', seat)
    // TODO: 메시지 보내기 모달 오픈
    closeContextMenu()
  }

  function formatRemainTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const SeatTimeLeft = ({ initialMinutes, timerKey }) => {

    const [remaining, setRemaining] = useState(initialMinutes * 60);

    // key 가 바뀌거나 initialMinutes 가 바뀌면 타이머 리셋 
    useEffect(() => {
      setRemaining(initialMinutes * 60);
    }, [initialMinutes, timerKey]);

    useEffect(() => {
      if (remaining <= 0 ) return; 
      const t = setInterval(() => setRemaining(prev => (prev > 0 ? prev - 1 : 0)), 1000)
      return () => clearInterval(t);
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
        onContextMenu={(e) => handleContextMenu(e, seat)}
      >
        <div className={styles.seatNumber}>
          {seat.seatName || seat.seatId}
          {seat.className === 'broken' ? ' (고장)' : ''}
        </div>

        {seat.username && <div className={styles.memberName}>{seat.username}</div>}

        {seat.className?.includes('in-use') && seat.remainTime != null && (
          <SeatTimeLeft initialMinutes={seat.remainTime} timerKey={seat._timerKey} />
          // <div className={styles.timeLeft} data-remaining={seat.remainTime}></div>
        )}

        {seat.className === 'cleaning' && (
          <button 
            className={styles.trashIcon} 
            data-seat-id={seat.seatId}
            onClick={() => onChangeSeatStatus(seat.seatId)}
            >
            <img src="/images/trash.png" alt="휴지통" />
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
      
      {/* 컨텍스트 메뉴 */}
      <SeatContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        seat={contextMenu.seat}
        onClose={closeContextMenu}
        onDailyHistory={handleDailyHistory}
        onUserInfo={handleUserInfo}
        onSendMessage={handleSendMessage}
      />
      
      {/* 회원 정보 모달 */}
      <UserInfoModal
        visible={userInfoModal.visible}
        userInfo={userInfoModal.userInfo}
        onClose={() => setUserInfoModal({ visible: false, userInfo: null })}
      />
      
      {/* 당일 내역 모달 */}
      <DailyHistoryModal
        visible={dailyHistoryModal.visible}
        seatId={dailyHistoryModal.seatId}
        historyData={dailyHistoryModal.historyData}
        onClose={() => setDailyHistoryModal({ visible: false, seatId: '', historyData: null })}
      />
    </div>
  )
}

export default SeatStatus
