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
import { useChat } from "../../../contexts/ChatContext";



const AdminLayout = () => {
  const { setSelfRole } = useChat();
  useEffect(() => {
    setSelfRole("counter");
  }, [setSelfRole]);

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
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('payment') === 'success') {
      setShowTicketSuccessModal(true);
      // URL에서 payment 파라미터 제거
      params.delete('payment');
      const rest = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (rest ? '?' + rest : ''));
    }
    if (params.get('payment') === 'fail') {
      setShowTicketSuccessModal(false);
      // URL에서 payment 파라미터 제거
      params.delete('payment');
      const rest = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (rest ? '?' + rest : ''));
    }
    
  }, []);

  useEffect(() => {
    // ws - topic : /topic/admin/logs
    const client = new Client({
      // brokerURL: 'ws://localhost:8080/ws',
      brokerURL: 'wss://powermanager159.cafe24.com/ws',
      connectHeaders: {},
      onConnect: () => {
        client.subscribe('/topic/admin/logs', message => {
          const payload = JSON.parse(message.body);
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(payload.description));

          // 로그아웃 메시지면 알림 띄우지 않음
          if (payload.description && payload.description.includes('님이 로그아웃하셨습니다.')) {
            return;
          }

          Swal.fire('관리자 알림', payload.description, 'info');
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