import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import powerIcon from '/images/전원.png'
import styles from './css/Header.module.css'
import { fetchSeatInfo } from '../../../apis/seatStatus'
const Header = () => {

  const [usedSeat, setUsedSeat] = useState(0);
  const [totalSeat, setTotalSeat] = useState(0);

  useEffect(() => {
    const getSeatInfo = async () => {
      try {
        const response = await fetchSeatInfo();
        const data = response.data;
        if (data.success) {
          setUsedSeat(data.currentUsage);
          setTotalSeat(data.totalSeats);
        }
      } catch (error) {
        setTotalSeat(0);
        setUsedSeat(0);
      }
    };

    getSeatInfo();

  }, []);

  // 3자리로 분리
  const toDigits = (num) =>  num.toString().padStart(3, '0').split('');
  const usedDigits = toDigits(usedSeat);
  const totalDigits = toDigits(totalSeat);

  return (
    <div className={styles.header}>
      <div className={styles['seat-wrapper']}>
        <div className={styles['seat-title']}>사용현황</div>

        {/* 좌석 현황 */}
        <div className={styles['seat-info']}>
          <div className={styles['seat-con-used']} id="used-seat-count">
            <div className={styles['seat-cell']}>{usedDigits[0]}</div>
            <div className={styles['seat-cell']}>{usedDigits[1]}</div>
            <div className={styles['seat-cell']}>{usedDigits[2]}</div>
          </div>
          <div className={styles['seat-con-all']} id="total-seat-count">
            <div className={styles['seat-cell']}>{totalDigits[0]}</div>
            <div className={styles['seat-cell']}>{totalDigits[1]}</div>
            <div className={styles['seat-cell']}>{totalDigits[2]}</div>
          </div>
        </div>


      </div>

      {/* 좌석 수 서버에서 받아오는 부분은 useEffect + state로 나중에 구현 가능 */}
      {/* <input type="hidden" id="using-seat-hidden" value={usingSeatCount} />
      <input type="hidden" id="total-seat-hidden" value={totalSeatCount} /> */}

      <div className={styles['header-nav-con']} style={{ display: 'flex', gap: '700px' }}>
        {/* 메뉴 */}
        <nav className={styles['header-nav']}>
          <Link to="/admin">매장관리</Link>
          <Link to="/admin/todayhistory">당일내역</Link>
          <Link to="/admin/user-list">회원관리</Link>
          <Link to="/admin/sales">운영매출</Link>
          <Link to="/admin/product-list">상품관리</Link>
          <Link to="/admin/logs">로그분석</Link>
        </nav>

        <div
          style={{
            width: '100px',
            height: '60px',
            backgroundColor: '#1e2b38',
            padding: '5px 10px',
            borderRadius: '5px',
            textAlign: 'center',
            fontSize: '16px'
          }}
        >
          <form action="/logout" method="post">
            {/* CSRF 토큰은 리액트에선 보통 JWT나 쿠키 기반이므로 생략하거나 별도 처리 */}
            <button
              type="submit"
              style={{ all: 'unset', fontSize: '15px', cursor: 'pointer' }}
            >
              <span style={{ color: 'white' }}>사용종료</span>
              <br />
              <img
                src={powerIcon}
                style={{ width: '23px', marginTop: '5px' }}
                alt="logout"
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Header
