import React from 'react'
import styles from './css/SidebarLeft.module.css'

const SidebarLeft = () => {
return (
    <div className={styles.sidebarLeft}>
      <a href="/members">
        <img src="/images/icons8-user-plus-54 (2).png" alt="회원등록 아이콘" />
        <span>회원등록</span>
      </a>
      <a href="#" id="openAdminSellCounterModalBtn">
        <img src="/images/icons8-cart-54.png" alt="상품판매 아이콘" />
        <span>상품판매</span>
      </a>
      <a href="#" id="openAdminTicketModalBtn">
        <img src="/images/icons8-ticket-52 (2).png" alt="이용권 판매 아이콘" />
        <span>이용권 판매</span>
      </a>
      <a href="#" id="showUsersBtn">
        <img src="/images/icons8-user-check-54 (2).png" alt="사용회원 아이콘" />
        <span>사용회원</span>
      </a>

      {/* 사용자 목록 모달 */}
      <div id="userModal" className={styles.usingModal} style={{ display: 'none' }}>
        <div className={styles.usingModalContent}>
          <span className={styles.usingClose} id="closeUserModal">&times;</span>

          {/* 🔍 검색창 */}
          <div className={styles.usingSearchBox}>
            <input type="text" id="userSearchInput" placeholder="이름/전화번호/아이디" />
            <button id="userSearchBtn">
              <img src="/images/search.png" alt="검색버튼" />
            </button>
          </div>

          {/* 사용자 목록 출력 영역 */}
          <div id="userListContainer">
            {/* Ajax로 사용자 목록이 들어감 */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarLeft