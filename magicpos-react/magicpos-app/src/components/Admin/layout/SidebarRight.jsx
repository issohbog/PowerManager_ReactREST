import React from 'react';
import styles from './css/SidebarRight.module.css';

const SidebarRight = ({ onOrderPopupToggle }) => {
  
  // ✅ 상품 버튼 클릭 핸들러
  const handleProductClick = (e) => {
    e.preventDefault();
    console.log("🛒 상품 버튼 눌림");
    if (onOrderPopupToggle) {
      onOrderPopupToggle();
    }
  };

  // ✅ 토글 버튼 클릭 핸들러
  const handleToggleClick = (e) => {
    e.preventDefault();
    console.log("⬅ 토글 버튼 눌림");
    if (onOrderPopupToggle) {
      onOrderPopupToggle();
    }
  };

  return (
    <div className={styles.sidebarRight} id="sidebarRight">
      <button 
        className={styles.toggleBtn}
        onClick={handleToggleClick}
      >
        <img src="/images/left-arrow.png" alt="좌측 화살표" />
      </button>

      <a 
        href="#" 
        id="toggle-orderpopup"
        onClick={handleProductClick}
      >
        <img src="/images/product.png" alt="상품" />
        <span>상품</span>
      </a>

      <a href="/admin/history/today/all">
        <img src="/images/product-clock.png" alt="판매현황" />
        <span>
          판매<br />현황
        </span>
      </a>
    </div>
  );
};

export default SidebarRight;
