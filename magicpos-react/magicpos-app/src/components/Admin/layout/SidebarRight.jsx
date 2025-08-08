import React from 'react';
import styles from './css/SidebarRight.module.css';

const SidebarRight = () => {
  return (
    <div className={styles.sidebarRight} id="sidebarRight">
      <button className={styles.toggleBtn}>
        <img src="/images/left-arrow.png" alt="좌측 화살표" />
      </button>

      <a href="#" id="toggle-orderpopup">
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
