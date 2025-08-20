import React, { useEffect, useState } from 'react'
import UserHeaderContainer from '../../containers/User/UserHeaderContainer'
import UserMenuContainer from '../../containers/User/UserMenuContainer'
import UserTicketContainer from '../../containers/User/UserTicketContainer';
import UserTicketSuccessModal from '../../components/User/modal/UserTicketSuccessModal';
import { getMenu } from '../../apis/menu'

const Menu = () => {

  // 여기서 만들어서 props 로 
  // UserHeaderContainer.jsx 에 전달(기존에는 UserHeaderContainer.jsx 에서 만들었음)
  const [usageInfo, setUsageInfo] = useState(null);
  const [usedTime, setUsedTime] = useState(null);
  const [remainTime, setRemainTime] = useState(null);


  // 요금제 구매 모달 상태 관리 
  const [showTicketModal, setShowTicketModal] = useState(false);

  // 요금제 구매 성공 모달 상태 관리 
  const [showUserTicketSuccessModal, setShowUserTicketSuccessModal] = useState(false);
  console.log("UserTicketSuccessModal 상태:", showUserTicketSuccessModal);

  // URL 파라미터 변경 감지
  // 1. ticketPayment url에서 발견하면 success/fail 에 맞게 모달 등장
  // 2. showTicketModal url에서 발견하면 요금제 구매 모달 자동 오픈
  // 공용 usageInfo 새로고침 함수
  const refreshUsageInfo = async () => {
    try {
      const resp = await getMenu()
      setUsageInfo(resp.data.usageInfo)
      setUsedTime(resp.data.usedTime)
      setRemainTime(resp.data.remainTime)
      // 최초 진입 후 남은시간이 0 이하라면 자동으로 요금제 구매 모달 열기 (이미 열린 상태가 아니고 결제 성공 모달도 아닐 때)
      if ((resp.data.remainTime ?? 0) <= 0 && !showTicketModal) {
        setShowTicketModal(true)
      }
    } catch (e) {
      console.error('usageInfo 갱신 실패', e)
    }
  }

  // 최초 진입 & URL 파라미터 처리 + 데이터 로드
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const handleParams = async () => {
      // 항상 최신 usageInfo 먼저 로드 (없으면 null 상태로 UI 깜빡임 방지)
      await refreshUsageInfo()

      // 결제 결과 모달
      if (params.get('ticketPayment') === 'success') {
        setShowUserTicketSuccessModal(true)
        // 결제 성공 직후 남은시간 갱신 (결제 완료 반영)
        await refreshUsageInfo()
      } else if (params.get('ticketPayment') === 'fail') {
        setShowUserTicketSuccessModal(false)
      }

      // /menu?showTicketModal=true 이면 구매 모달 자동 오픈
      if (params.get('showTicketModal') === 'true') {
        setShowTicketModal(true)
        params.delete('showTicketModal')
        const rest = params.toString()
        window.history.replaceState({}, '', '/menu' + (rest ? '?' + rest : ''))
      }
    }

    handleParams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCloseUserTicketSuccessModal = async () => {
    setShowUserTicketSuccessModal(false)
    // 사용시간/남은시간 다시 반영
    await refreshUsageInfo()
    window.history.replaceState({}, '', '/menu')
  }

  return (
    <>
        <UserHeaderContainer 
          usageInfo={usageInfo}
          setUsageInfo={setUsageInfo}
          usedTime={usedTime}
          setUsedTime={setUsedTime}
          remainTime={remainTime}
          setRemainTime={setRemainTime}
          onOpenTicketModal={() => setShowTicketModal(true)}   // {/* 요금제 구매 모달 여는 함수 헤더에 연결 */}
        />      
        <UserMenuContainer />
        {showTicketModal && (       
          <UserTicketContainer 
            open={showTicketModal}
            onClose={() => setShowTicketModal(false)}
            usageInfo={usageInfo}
          />
        )}
        {/* TODO: 요금제 구매 성공 모달 추가하기  */}
        {showUserTicketSuccessModal && (
          <UserTicketSuccessModal 
            open={showUserTicketSuccessModal}
            onClose={handleCloseUserTicketSuccessModal}
          />
        )}
    </>
  )
}

export default Menu
