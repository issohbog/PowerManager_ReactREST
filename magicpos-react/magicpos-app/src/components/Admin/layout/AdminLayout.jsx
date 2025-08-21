import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import SidebarLeft from './SidebarLeft'
import SidebarRight from './SidebarRight'
import OrderPopupContainer from '../../../containers/Admin/OrderPopupContainer'
import AdminTicketContainer from '../../../containers/Admin/AdminTicketContainer' // 👮‍♀️🎫 관리자 요금제 구매 모달 컨테이너
import TicketSuccessModal from '../modal/TicketSuccessModal'
import { Client } from '@stomp/stompjs';
import Swal from 'sweetalert2';



const AdminLayout = () => {
  // ✅ OrderPopup 상태 관리
  const [showOrderPopup, setShowOrderPopup] = useState(false)

  // ✅ OrderPopup 토글 함수
  const handleOrderPopupToggle = () => {
    setShowOrderPopup(prev => !prev)
    console.log('🔄 OrderPopup 토글:', !showOrderPopup)
  }

  // ✅ OrderPopup 닫기 함수
  const handleOrderPopupClose = () => {
    setShowOrderPopup(false)
    console.log('❌ OrderPopup 닫기')
  }

  // 👮‍♀️🎫 관리자 요금제 구매 모달 상태 관리 
  const [showAdminTicketModal, setShowAdminTicketModal] = useState(false);
  console.log('👮‍♀️🎫 AdminTicketModal 상태:', showAdminTicketModal);


  // 관리자 요금제 구매 성공 모달 상태 관리
  const [showTicketSuccessModal, setShowTicketSuccessModal] = useState(false);
  console.log('👮‍♀️🎫 TicketSuccessModal 상태:', showTicketSuccessModal);

  // URL 파라미터 변경 감지(payment를 url에서 발견하면 success/fail 에 맞게 모달 등장)
  useEffect(() => {
    const param = new URLSearchParams(window.location.search);
    if (param.get('payment') === 'success') {
      setShowTicketSuccessModal(true);
    }
    if (param.get('payment') === 'fail') {
      setShowTicketSuccessModal(false);
    }
    
  }, []);

  useEffect(() => {
    // ws - topic : /topic/admin/logs
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {},
      onConnect: () => {
        client.subscribe('/topic/admin/logs', message => {
          const payload = JSON.parse(message.body);
          Swal.fire('관리자 알림', payload.description, 'info');
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(payload.description));
        });
      },
      debug: str => console.log(str),
      reconnectDelay: 5000,
    });
    client.activate();

    return () => {
      client.deactivate();
    }
  }, []);



  return (
    <>
        <Header />
        <div className="admin-container">
            <SidebarLeft onOpenAdminTicketModal={() => setShowAdminTicketModal(true)} />  {/* 👮‍♀️🎫 관리자 요금제 구매 모달 열기 */}
            <main className='admin-main'>
                <div className="admin-content">
                  <Outlet />  {/* 여기에 각 메뉴 내용이 들어옴 */}
                </div>
            </main>
            <SidebarRight onOrderPopupToggle={handleOrderPopupToggle} />
        </div>
        {/* ✅ OrderPopup 모달 */}
        <OrderPopupContainer
          isVisible={showOrderPopup}
          onClose={handleOrderPopupClose}
        />

        {/* 👮‍♀️🎫 AdminTicketModal 모달 - 관리자 요금제 구매 모달*/}
        {showAdminTicketModal && 
          <AdminTicketContainer 
            open={showAdminTicketModal}   
            onClose={() => setShowAdminTicketModal(false)} />} 

        {/* 👮‍♀️🎫 TicketSuccessModal 모달 - 관리자 요금제 구매 성공 모달 */}
        {showTicketSuccessModal && (
          <TicketSuccessModal
            open={showTicketSuccessModal}
            onClose={() => setShowTicketSuccessModal(false)}
          />
        )}
    </>
  )
}

export default AdminLayout