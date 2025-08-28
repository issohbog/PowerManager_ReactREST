// containers/admin/SeatStatusContainer.jsx
import { useEffect, useState } from 'react'
import { clearSeat, select } from '../../apis/seatStatus'
import SelectSeat from '../../components/User/modal/SelectSeat'
import Swal from 'sweetalert2';

const SelectSeatContainer = ({ onClose, setSeatId }) => {
  const [topSeats, setTopSeats] = useState([])
  const [middleSeats, setMiddleSeats] = useState([])
  const [bottomSeats, setBottomSeats] = useState([])
  const [allSeats, setAllSeats] = useState([])

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
  }, [])

  return (
    <SelectSeat
      // 위치 기반 렌더링용
      allSeats={allSeats}
      // 하위 호환성용 분단별 데이터
      topSeats={topSeats}
      middleSeats={middleSeats}
      bottomSeats={bottomSeats}
      onChangeSeatStatus={handleChangeSeatStatus}
      onClose={onClose}
      setSeatId={setSeatId}
    />
  )
}


export default SelectSeatContainer
