import React, { useEffect, useRef, useState } from 'react';
import AdminTicketModal from '../../components/Admin/modal/AdminTicketModal';
import { fetchTicketInfo, fetchTickets, insertUserTicketByAdmin, searchUsersForTicket } from '../../apis/Ticket';
import { useLocation } from 'react-router-dom';

const AdminTicketContainer = ({ open, onClose }) => {
  // 상태 선언 
  const [searchKeyword, setSearchKeyword] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [ticketList, setTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [userSearchVisible, setUserSearchVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1); // 검색 결과 포커스 인덱스

  // 토스 페이먼츠 SDK를 사용하기 위한 초기화
  const tossPayments = window.TossPayments('test_ck_ZLKGPx4M3MGPnBZkRAlwrBaWypv1');

  // debounce(입력멈춤감지) 타이머를 저장하는 ref
  const debounceRef = useRef();

  // 모달이 열릴 때마다 (open이 true가 될 때) 초기화 작업 수행
  useEffect(() => {
    console.log('AdminTicketContainer 렌더링, open:', open);
    // 티켓 목록 가져오는 API 호출
    if (open) {
      const loadTickets = async () => {
        const response = await fetchTickets(); // 티켓 목록을 가져오는 API 호출
        const data = response.data || {};
        setTicketList(data.tickets || []);
        console.log('티켓 목록:', data.tickets);
      };
      loadTickets();

      // 모달 열릴 때 상태 초기화
      setSearchKeyword('');
      setUserSearchResults([]);
      setSelectedUser(null);
      setSelectedTicket(null);
      setSelectedPayment(null);
      setUserSearchVisible(false);
    }
  }, [open]);

  // 회원 검색 debounce
  useEffect(() => {
    if (!searchKeyword) {
      setUserSearchResults([]);
      setUserSearchVisible(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await searchUsersForTicket(searchKeyword)
        const data = response.data || {};
        setUserSearchResults(data.users || []);
        setUserSearchVisible(true);
        setFocusedIndex(-1); // 검색 결과 바뀌면 포커스 초기화
        console.log('회원 검색 결과:', data.users);
      } catch (error) {
        setUserSearchResults([]);
        setUserSearchVisible(false);
        setFocusedIndex(-1);
        console.error('회원 검색 중 오류 발생:', error);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchKeyword]);

  // 회원 선택 
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchKeyword(`${user.username} (${user.userId})`);      // backend에서 주는 값(username, userId)으로 세팅
    setUserSearchVisible(false);
    setFocusedIndex(-1);
  };

  const handleInputChange = (e) => {
    setSearchKeyword(e.target.value);
    setSelectedUser(null); // 입력이 바뀌면 선택된 회원 초기화
    setFocusedIndex(-1);
  };

  // input에서 방향키/엔터키 처리
  const handleInputKeyDown = (e) => {
    if (!userSearchVisible || userSearchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = prev + 1;
        return next >= userSearchResults.length ? userSearchResults.length - 1 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? 0 : next;
      });
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleUserSelect(userSearchResults[focusedIndex]);
    }
  };

  // 요금제 티켓 선택
  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
  };

  // 결제 방법 선택 
  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  // 현재 페이지 정보 가져오기
  const location = useLocation();
  const path = location.pathname; 
  const currentPage = path.startsWith('/admin/') ? path.replace('/admin/', '') : '';



  // 결제 버튼 클릭 시 - 결제 처리 
  const handleBuy = async () => {
    if (!selectedUser) return alert('회원을 선택해주세요.');
    if (!selectedTicket) return alert('요금제를 선택해주세요.');
    if (!selectedPayment) return alert('결제 방법을 선택해주세요.');

    if (selectedPayment === 'CASH') {
      // 현금 결제 로직 
      const payload = {
        uNo: selectedUser.userNo,       // backend api에서 내려주는 userNo 객체의 필드명
        tNo: selectedTicket.no,     // backend 티켓목록 api에서 내려주는 ticket 객체의 필드명 
        payment: 'CASH', 
        payAt: new Date().toISOString(),
      };
      const response = await insertUserTicketByAdmin(payload);        // 추후 요청 함수 확인 필요
      const data = response.data || {};
      if(data.success) {
        alert('요금제 구매가 완료되었습니다. ');
        onClose(); // 구매 후 모달 닫기
      } else {
        alert(data.message || '요금제 구매에 실패했습니다.');
      }
    } else if (selectedPayment === 'CARD') {
      // 신용카드 결제 로직 : 토스페이먼츠 연동 
      const ticketInfoRes = await fetchTicketInfo(selectedTicket.no);
      const ticketInfo = ticketInfoRes.data || {}; 
      if (!ticketInfo.price) {
        return alert('요금제 정보를 가져오는 데 실패했습니다.');
      }
      console.log("토스 페이먼츠 " , tossPayments);
      // 토스페이먼츠 결제창 호출 
      tossPayments?.requestPayment('카드', {
        amount: ticketInfo.price,
        orderId: `admin_ticket_${Date.now()}_user_${selectedUser.userNo}_ticket_${selectedTicket.no}`, 
        orderName: ticketInfo.ticketName, 
        customerName: '관리자', 
        successUrl: `http://${ticketInfo.serverIp}:8080/admin/payment/ticket/success?currentPage=${currentPage}`, 
        failUrl: `http://${ticketInfo.serverIp}:8080/admin/payment/ticket/fail?currentPage=${currentPage}`,
      })
      
      onClose(); // 구매 후 모달 닫기
    }
  };

  // 취소 버튼 클릭 시
  const handleCancel = () => {
    onClose();
  };

  return (
    <AdminTicketModal
      open={open}
      onClose={onClose}
      searchKeyword={searchKeyword}
      setSearchKeyword={setSearchKeyword}
      userSearchResults={userSearchResults}
      userSearchVisible={userSearchVisible}
      onUserSelect={handleUserSelect}
      selectedUser={selectedUser}
      ticketList={ticketList}
      selectedTicket={selectedTicket}
      onTicketSelect={handleTicketSelect}
      selectedPayment={selectedPayment}
      onPaymentSelect={handlePaymentSelect}
      onBuy={handleBuy}
      onInputChange={handleInputChange}
      onInputKeyDown={handleInputKeyDown}
      focusedIndex={focusedIndex}
    />
  );
}

export default AdminTicketContainer;