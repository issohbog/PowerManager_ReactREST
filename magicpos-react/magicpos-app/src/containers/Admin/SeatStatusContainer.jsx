// containers/admin/SeatStatusContainer.jsx
import { useEffect, useState } from 'react'
import { select } from '../../apis/seatStatus'
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
    />
  )
}

export default SeatStatusContainer
