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
    // select().then(data => {
    //   console.log('좌석 API 응답:', data) // ← 추가된 로그
    //   setTopSeats(data.topSeats ?? [])
    //   setMiddleSeats(data.middleSeats ?? [])
    //   setBottomSeats(data.bottomSeats ?? [])
    // }).catch(error => {
    //   console.error('좌석 현황을 불러오는 데 실패했습니다:', error)
    // })
    getSeatStatus()

    // STOMP 클라이언트 설정
    // const client = new Client({
    //   brokerURL: (window.location.protocol === 'https:'
    //     ? 'wss://' + window.location.host
    //     : 'ws://' + window.location.host) + '/ws',
    //   reconnectDelay: 5000,
    //   onConnect: () => {
    //     console.log('[WS] connected seats topic')
    //     client.subscribe('/topic/admin/seats', (msg) => {
    //       try {
    //         const data = JSON.parse(msg.body)

    //         if (data.type === 'PATCH' && data.seat) {
    //           const s = data.seat;
    //           const apply = (setter) => setter(seats => {
    //             let hit = false;
    //             const next = seats.map(seat => {
    //               if (seat.seatId === s.seatId) {
    //                 hit = true;
    //                 return {
    //                   ...seat,
    //                   className: s.className ?? seat.className,
    //                   username:  s.username  ?? seat.username,
    //                   remainTime:s.remainTime?? seat.remainTime,
    //                   _timerKey: (s.remainTime != null) ? Date.now() : seat._timerKey,
    //                 };
    //               }
    //               return seat;
    //             });
    //             // 좌석 배열에 없다면(초기 로드 전 등) 안전하게 삽입
    //             if (!hit) {
    //               const num = parseInt(s.seatId.substring(1), 10);
    //               // 이 컨테이너(setter)가 어느 섹션인지 모르므로 일단 그대로 반환 (실제 섹션은 SNAPSHOT이 곧 들어옴)
    //               // 또는 top/middle/bottom 기준으로 분기해서 push 가능
    //             }
    //             return next;
    //           });

    //           apply(setTopSeats);
    //           apply(setMiddleSeats);
    //           apply(setBottomSeats);

    //           // 보정: 아주 짧게 뒤에 전체 상태를 동기화 (트랜잭션 타이밍 이슈 완충)
    //           setTimeout(() => getSeatStatus(), 250);
    //           return;
    //       }

    //         if (data.type === 'SNAPSHOT') {
    //           if (Array.isArray(data.topSeats) || Array.isArray(data.middleSeats) || Array.isArray(data.bottomSeats)) {
    //             // 타이머 초기화 키 부여 
    //             const withKeys = arr => (arr || []).map(x => ({ ...x, _timerKey: Date.now()}))
    //             setTopSeats(withKeys(data.topSeats))
    //             setMiddleSeats(withKeys(data.middleSeats))
    //             setBottomSeats(withKeys(data.bottomSeats))
    //           } else if (Array.isArray(data.seats)) {
    //             // 하위호환 (구 payload)
    //             partitionSeats(data.seats)
    //           }
    //         }
    //       } catch (e) {
    //         console.error('좌석 메시지 파싱 오류:', e)
    //       }
    //     })
    //     // 연결 직후 한번 최신 상태 강제 요청 (경쟁조건 방지)
    //     getSeatStatus()
    //   }
    // })
    // client.onStompError = (frame) => {
    //   console.error('[WS] STOMP error', frame.headers['message'], frame.body)
    // }
    // client.onWebSocketClose = () => {
    //   console.warn('[WS] closed seats topic')
    // }
    // client.activate()
    // stompRef.current = client


    // ws - topic : /topic/admin/seats
    const clientSeats = new Client({
      brokerURL: 'ws://localhost:8080/ws',
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
      // if (stompRef.current) {
      //   stompRef.current.deactivate()
      // }
      // if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)

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
