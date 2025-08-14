import React, { useState } from 'react';
import styles from './css/SidebarLeft.module.css';
import UsingUserModalContainer from '../../../containers/Admin/UsingUserModalContainer';
import SellCounterModalContainer from '../../../containers/Admin/SellCounterModalContainer';

const SidebarLeft = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  // 사용회원 버튼 클릭 시 모달 열기
  const handleShowUsers = (e) => {
    e.preventDefault();
    setShowUserModal(true);
  };

  // 상품판매 버튼 클릭 시 모달 열기
  const handleShowSellModal = (e) => {
    e.preventDefault();
    setShowSellModal(true);
  };

  // 모달 닫기
  const handleCloseUserModal = () => {
    setShowUserModal(false);
  };
  const handleCloseSellModal = () => {
    setShowSellModal(false);
  };

  return (
    <div className={styles.sidebarLeft}>
      <a href="/members">
        <img src="/images/icons8-user-plus-54 (2).png" alt="회원등록 아이콘" />
        <span>회원등록</span>
      </a>
      
      {/* 상품판매 버튼에 onClick 추가 */}
      <a href="#" id="openAdminSellCounterModalBtn" onClick={handleShowSellModal}>
        <img src="/images/icons8-cart-54.png" alt="상품판매 아이콘" />
        <span>상품판매</span>
      </a>
      
      <a href="#" id="openAdminTicketModalBtn">
        <img src="/images/icons8-ticket-52 (2).png" alt="이용권 판매 아이콘" />
        <span>이용권 판매</span>
      </a>
      
      {/* 사용회원 버튼 */}
      <a href="#" onClick={handleShowUsers}>
        <img src="/images/icons8-user-check-54 (2).png" alt="사용회원 아이콘" />
        <span>사용회원</span>
      </a>

      {/* 사용자 목록 모달 */}
      <UsingUserModalContainer
        isVisible={showUserModal}
        onClose={handleCloseUserModal}
      />

      {/* 상품 판매 모달 */}
      <SellCounterModalContainer
        isVisible={showSellModal}
        onClose={handleCloseSellModal}
      />
    </div>
  );
};

export default SidebarLeft;