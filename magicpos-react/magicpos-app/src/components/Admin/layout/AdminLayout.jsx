import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'

import SidebarLeft from './SidebarLeft'
import SidebarRight from './SidebarRight'
import OrderPopupContainer from '../../../containers/Admin/OrderPopupContainer'
import AdminTicketContainer from '../../../containers/Admin/AdminTicketContainer' // 👮‍♀️🎫 관리자 요금제 구매 모달 컨테이너
import TicketSuccessModal from '../modal/TicketSuccessModal'
import UserModal from '../modal/UserModal' // 🧑‍💼 회원등록 모달 추가
import RegisterResultModal from '../modal/RegisterResultModal' // 🧑‍💼 회원등록 결과 모달 추가
import { Client } from '@stomp/stompjs';
import Swal from 'sweetalert2';
import { useChat } from "../../../contexts/ChatContext";
import { saveUser, checkUserId } from '../../../apis/userList'; // 🧑‍💼 사용자 관련 API 수정



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

  // 🧑‍💼 사이드바 회원등록 모달 상태 관리 (헤더 모달과 별개)
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const [sidebarModalMode, setSidebarModalMode] = useState('register');
  const [sidebarSelectedUser, setSidebarSelectedUser] = useState(null);
  const [sidebarIdCheckMessage, setSidebarIdCheckMessage] = useState('');
  const [sidebarIdCheckStatus, setSidebarIdCheckStatus] = useState('');
  const [sidebarRegisterResult, setSidebarRegisterResult] = useState(null);
  const [sidebarShowRegisterResultModal, setSidebarShowRegisterResultModal] = useState(false);
  // 🧑‍💼 사이드바 모달 열기 함수
  const openSidebarModal = (mode, user) => {
    setSidebarModalMode(mode);
    setSidebarSelectedUser(user || null);
    setSidebarIdCheckMessage('');   // 메시지 초기화
    setSidebarIdCheckStatus('');    // 상태 초기화
    setSidebarModalOpen(true);
  };

  // 🧑‍💼 사이드바 모달 닫기 함수
  // const closeSidebarModal = () => setSidebarModalOpen(false);
  const closeSidebarModal = () => {
  setSidebarModalOpen(false);
  setSidebarRegisterResult(null);
  setSidebarShowRegisterResultModal(false);
  setSidebarIdCheckMessage('');
  setSidebarIdCheckStatus('');
  setSidebarSelectedUser(null);
};

  // 🧑‍💼 사이드바 회원등록 모달 열기 함수 (사이드바에서 호출)
  const handleOpenSidebarUserRegisterModal = () => {
    openSidebarModal('register');
  };

  // 🧑‍💼 사이드바 회원등록 처리 함수
  const handleSidebarSave = async (userData) => {
    if (sidebarModalMode === 'register') {
      try {
        const response = await saveUser(userData);
        setSidebarRegisterResult(response.data);
        setSidebarShowRegisterResultModal(true);
        closeSidebarModal();
      } catch (error) {
        console.error('회원등록 실패:', error);
        alert('회원등록에 실패했습니다.');
      }
    }
  };

  // 🧑‍💼 사이드바 아이디 중복확인 함수
  const handleSidebarIdCheck = async (id) => {
    try {
      const response = await checkUserId(id);
      if (response.data.exists) {
        setSidebarIdCheckMessage('이미 사용 중인 아이디입니다.');
        setSidebarIdCheckStatus('error');
      } else {
        setSidebarIdCheckMessage('사용 가능한 아이디입니다.');
        setSidebarIdCheckStatus('success');
      }
    } catch (error) {
      console.error('아이디 중복확인 실패:', error);
      setSidebarIdCheckMessage('중복확인 중 오류가 발생했습니다.');
      setSidebarIdCheckStatus('error');
    }
  };

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

      // brokerURL: 'wss://powermanager159.cafe24.com/ws',

      // brokerURL: 'wss://powermanager1.cafe24.com/ws',
      brokerURL: `wss://${window.location.hostname}/ws`,
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
        <SidebarLeft 
          onOpenUserRegisterModal={handleOpenSidebarUserRegisterModal} 
          onOpenAdminTicketModal={() => setShowAdminTicketModal(true)}
        />
        <main className='admin-main'>
          <div className="admin-content">
            <Outlet />
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
      {/* 🧑‍💼 사이드바 회원등록 모달 */}
      {sidebarModalOpen && (
        <UserModal
          open={sidebarModalOpen}
          mode={sidebarModalMode}
          user={sidebarSelectedUser}
          onClose={closeSidebarModal}
          onSave={handleSidebarSave}
          onIdCheck={handleSidebarIdCheck}
          idCheckMessage={sidebarIdCheckMessage}
          idCheckStatus={sidebarIdCheckStatus}
        />
      )}
      {/* 🧑‍💼 사이드바 회원등록 결과 모달 */}
      <RegisterResultModal
        open={sidebarShowRegisterResultModal}
        onClose={() => setSidebarShowRegisterResultModal(false)}
        result={sidebarRegisterResult}
      />
    </>
  )
}

export default AdminLayout