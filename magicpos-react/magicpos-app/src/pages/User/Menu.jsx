import React, { useEffect, useState } from 'react'
import UserHeaderContainer from '../../containers/User/UserHeaderContainer'
import UserMenuContainer from '../../containers/User/UserMenuContainer'
import UserTicketContainer from '../../containers/User/UserTicketContainer';
import UserTicketSuccessModal from '../../components/User/modal/UserTicketSuccessModal';

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

  // URL 파라미터 변경 감지(payment를 url에서 발견하면 success/fail 에 맞게 모달 등장)
  useEffect(() => {
    const param = new URLSearchParams(window.location.search);
    if (param.get('ticketPayment') === 'success') {
      setShowUserTicketSuccessModal(true);
    }
    if (param.get('ticketPayment') === 'fail') {
      setShowUserTicketSuccessModal(false);
    }
  }, []);

  const handleCloseUserTicketSuccessModal = () => {
    setShowUserTicketSuccessModal(false);
    // url 에서 쿼리 스트링 제거
    window.history.replaceState({}, '', '/menu');
  };

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
