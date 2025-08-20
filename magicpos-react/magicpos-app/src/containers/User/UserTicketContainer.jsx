import React, { useEffect, useState } from 'react'
import UserTicketModal from '../../components/User/modal/UserTicketModal';
import { fetchTickets, fetchTicketInfo, fetchPaymentInfo } from '../../apis/Ticket';

const UserTicketContainer = ({ open, onClose, usageInfo }) => {
  const [ticketList, setTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // 모달이 열릴 때 마다 요금제 목록 불러오기
  useEffect(() => {
    if (open) { 
      const loadTickets = async () => {
        const response = await fetchTickets();      // 티켓 목록 가져오는 API 호출
        const data = response.data || {};
        console.log("티켓 조회 : ", data);
        setTicketList(data.tickets || []);
      };

      loadTickets();
      setSelectedTicket(null); // 모달 열릴 때 선택된 티켓 초기화
    }
  }, [open]);


  // 요금제 선택 
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  // 결제 버튼 클릭 
  const handlePayment = async () => {
    if (!selectedTicket) {
      alert('요금제를 선택해주세요');
      return;
    };

    if (!usageInfo?.userNo) {
      alert('사용자 정보를 불러올 수 없습니다.');
      return;
    }

    // 1. 결제 정보 벡엔드에서 받아오기 
    const res = await fetchPaymentInfo({
      userNo: usageInfo.userNo,
      ticketNo: selectedTicket.no,
    })
    console.log("ticketNo : ", selectedTicket.no);

    const paymentInfo = res.data || {};

    if (!paymentInfo.amount || !paymentInfo.orderId) {
      alert('결제 정보를 불러올 수 없습니다.');
      return;
    }

    // 결제창 호출
    const tossPayments = window.TossPayments && new window.TossPayments('test_ck_ZLKGPx4M3MGPnBZkRAlwrBaWypv1');
    tossPayments.requestPayment('카드', {
      amount: paymentInfo.amount,
      orderId: paymentInfo.orderId,
      orderName: paymentInfo.orderName,
      customerName: paymentInfo.customerName,
      successUrl: paymentInfo.successUrl,
      failUrl: paymentInfo.failUrl,
    });


  };

  return (
    <UserTicketModal
      open={open}
      onClose={onClose}
      ticketList={ticketList}
      selectedTicket={selectedTicket}
      onSelectTicket={handleSelectTicket}
      onPayment={handlePayment}
    />
  )
}

export default UserTicketContainer