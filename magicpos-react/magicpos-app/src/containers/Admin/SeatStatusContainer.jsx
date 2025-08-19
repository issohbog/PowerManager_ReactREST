// containers/admin/SeatStatusContainer.jsx
import { useEffect, useState } from 'react'
import { clearSeat, select } from '../../apis/seatStatus'
import SeatStatus from '../../components/Admin/SeatStatus'

const SeatStatusContainer = () => {
  const [topSeats, setTopSeats] = useState([])
  const [middleSeats, setMiddleSeats] = useState([])
  const [bottomSeats, setBottomSeats] = useState([])

  // 좌석 현황을 API로부터 불러오기
  const getSeatStatus = async () => {
    try {
      const response = await select()
      const data = response.data // API 응답 데이터
      console.log('좌석 API 응답:', data) // ← 추가된 로그
      setTopSeats(data.topSeats || [])
      setMiddleSeats(data.middleSeats || [])
      setBottomSeats(data.bottomSeats || [])
    } catch (error) {
      console.error('좌석 현황을 불러오는 데 실패했습니다:', error)
    }
  }

  // 좌석 상태 변경 핸들러(청소중 -> 이용가능)
  const handleChangeSeatStatus = async (seatId) => {
    try {
      const result = await clearSeat(seatId)
      if (result.data && result.data.success) {
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
      } else {
        alert(result.data.message || '좌석 상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('좌석 상태 변경 중 오류 발생:', error)
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
  }, [])

  return (
    <SeatStatus
      topSeats={topSeats}
      middleSeats={middleSeats}
      bottomSeats={bottomSeats}
      onChangeSeatStatus={handleChangeSeatStatus}
    />
  )
}


export default SeatStatusContainer
