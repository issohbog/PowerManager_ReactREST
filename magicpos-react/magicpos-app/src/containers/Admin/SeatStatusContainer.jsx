// containers/admin/SeatStatusContainer.jsx
import { useEffect, useState, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { clearSeat, select } from '../../apis/seatStatus'
import SeatStatus from '../../components/Admin/SeatStatus'
import Swal from 'sweetalert2';

const SeatStatusContainer = () => {

  // 하위 호환성: 기존 분단별 상태 (다른 코드에서 사용할 수 있도록 유지)
  const [topSeats, setTopSeats] = useState([])
  const [middleSeats, setMiddleSeats] = useState([])
  const [bottomSeats, setBottomSeats] = useState([])
  
  // 위치 기반: 전체 좌석 상태 (새로운 렌더링 방식용)
  const [allSeats, setAllSeats] = useState([])

  // 웹소켓 추가 
  const stompRef = useRef(null)
  const reconnectTimerRef = useRef(null)

  // 좌석 배열을 top/middle/bottom 으로 나누는 공통 함수
  const partitionSeats = (all) => {
    const top = []
    const middle = []
    const bottom = []
    all.forEach(seat => {
      if (!seat.seatId) return
      const num = parseInt(seat.seatId.substring(1), 10)
      if (num <= 12) top.push(seat)
      else if (num <= 22) middle.push(seat)
      else bottom.push(seat)
    })
    setTopSeats(top)
    setMiddleSeats(middle)
    setBottomSeats(bottom)
  }

  // 좌석 현황을 API로부터 불러오기
  const getSeatStatus = async () => {
    try {
      const response = await select()
      const data = response.data // API 응답 데이터
      
      console.log('🔍 API 전체 응답:', response)
      console.log('🔍 API 응답 데이터:', data)
      console.log('🔍 data.seats:', data.seats)
      console.log('🔍 data.seats 타입:', typeof data.seats, Array.isArray(data.seats))
      
      // 새로운 방식: 전체 좌석 배열 사용 (위치 기반 렌더링용)
      if (data.seats && Array.isArray(data.seats)) {
        console.log('✅ 위치 기반 좌석 데이터 설정:', data.seats.length, '개')
        console.log('✅ 좌석 데이터 샘플:', data.seats.slice(0, 3))
        setAllSeats(data.seats)
      } else {
        console.error('❌ seats 배열이 없습니다')
        setAllSeats([])
      }
      
      // 하위 호환성: 기존 분단별 방식도 설정 (다른 코드에서 사용할 수 있도록)
      setTopSeats(data.topSeats || [])
      setMiddleSeats(data.middleSeats || [])
      setBottomSeats(data.bottomSeats || [])
      
      console.log('🔍 분단별 데이터:', {
        topSeats: data.topSeats?.length || 0,
        middleSeats: data.middleSeats?.length || 0,
        bottomSeats: data.bottomSeats?.length || 0
      })
      
    } catch (error) {
      console.error('❌ 좌석 현황을 불러오는 데 실패했습니다:', error)
    }
  }

  // 좌석 상태 변경 핸들러(청소중 -> 이용가능)
  const handleChangeSeatStatus = async (seatId) => {
    console.log('🔧 좌석 상태 변경 시도:', seatId)
    try {
      const result = await clearSeat(seatId)
      console.log('🔧 clearSeat API 응답:', result)
      
      if (result.data && result.data.success) {
        console.log('✅ 좌석 상태 변경 성공, UI 업데이트 중...')
        
        // 위치 기반 렌더링용 allSeats 업데이트
        setAllSeats(seats =>
          seats.map(seat =>
            seat.seatId === seatId ? { ...seat, className: 'available' } : seat
          )
        )
        
        // 하위 호환성용 분단별 상태도 업데이트
        setTopSeats(seats =>
          seats.map(seat =>
            seat.seatId === seatId ? { ...seat, className: 'available' } : seat
          )
        )
        setMiddleSeats(seats =>
          seats.map(seat =>
            seat.seatId === seatId ? { ...seat, className: 'available' } : seat
          )
        )
        setBottomSeats(seats =>
          seats.map(seat =>
            seat.seatId === seatId ? { ...seat, className: 'available' } : seat
          )
        )
        
        console.log('✅ 모든 상태 업데이트 완료')
      } else {
        console.error('❌ 좌석 상태 변경 실패:', result.data)
        alert(result.data.message || '좌석 상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 좌석 상태 변경 중 오류 발생:', error)
      alert('좌석 상태 변경 중 오류가 발생했습니다.')
    }
  }

  useEffect(() => {

    getSeatStatus()

    // ws - topic : /topic/admin/seats
    const clientSeats = new Client({
      // brokerURL: 'ws://localhost:8080/ws',
      // brokerURL: 'wss://powermanager1.cafe24.com/ws',
      brokerURL: `wss://${window.location.hostname}/ws`,
      connectHeaders: {},
      onConnect: () => {
        clientSeats.subscribe('/topic/admin/seats', message => {
          const payload = JSON.parse(message.body);
          console.dir(payload);

          if (payload.type === 'PATCH' && payload.seat) {
            const { seatId, username, className } = payload.seat;
            console.log('PATCH 이벤트 수신:', { seatId, username, className });
            
            if (Swal) {
              let title, icon;
              if (className === 'in-use') {
                // 로그인/좌석 사용 시작
                title = `좌석 ${seatId} - ${username}`;
                icon = 'info';
                console.log('로그인 토스트 표시:', title);
              } else if (className === 'cleaning') {
                // 로그아웃/좌석 해제 시
                title = `좌석 ${seatId} - ${username} 로그아웃`;
                icon = 'warning';
                console.log('로그아웃 토스트 표시:', title);
              } else {
                // 기타 상태 변경
                title = `좌석 ${seatId} 상태 변경`;
                icon = 'info';
                console.log('기타 상태 변경 토스트 표시:', title);
              }

              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: icon,
                title: title,
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
              });
            } else {
              console.error('Swal이 로드되지 않았습니다');
            }
          }

          // 좌석 갱신
          getSeatStatus()
        });
      },
      debug: str => console.log(str),
      reconnectDelay: 5000,
    });
    clientSeats.activate();

    return () => {
      clientSeats.deactivate();
    }
  }, [])

  return (
    <SeatStatus
      // 위치 기반 렌더링용
      allSeats={allSeats}
      // 하위 호환성용 분단별 데이터
      topSeats={topSeats}
      middleSeats={middleSeats}
      bottomSeats={bottomSeats}
      onChangeSeatStatus={handleChangeSeatStatus}
    />
  )
}


export default SeatStatusContainer
