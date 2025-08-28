import React, { useEffect, useState } from 'react';
import styles from '../../css/Usinguser.module.css';

const UsingUserModal = ({
  isVisible,
  onClose,
  userList,
  loading,
  keyword,
  setKeyword,
  onSearch,
  onKeyPress,
}) => {
  if (!isVisible) return null;

  // 사용자별 남은시간 상태 관리
  const [remainSecondsList, setRemainSecondsList] = useState([]);

  // userList가 변경될 때마다 남은시간 초기화
  useEffect(() => {
    setRemainSecondsList(userList.map(u => u.remain_seconds || 0));
  }, [userList]);

  // 1초마다 남은시간 감소
  useEffect(() => {
    if (!isVisible || loading) return;
    const timer = setInterval(() => {
      setRemainSecondsList(prev =>
        prev.map(sec => Math.max(0, sec - 1))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [isVisible, loading, userList.length]);

  // 초를 시:분:초 형태로 변환
  const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return "만료됨";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleModalClick = (e) => {
    if (e.target.classList.contains('usingmodal')) {
      onClose();
    }
  };

  return (
    <div className={styles.usingmodal} onClick={handleModalClick}>
      <div className={styles.usingmodalContent}>
        {/* 닫기 버튼 */}
        <span className={styles.usingclose} onClick={onClose}>&times;</span>

        {/* 🔍 검색창 */}
        <div className={styles.usingSearchBox}>
          <input
            type="text"
            placeholder="이름/전화번호/아이디"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={onKeyPress}
          />
          <button onClick={onSearch}>
            <img src="/images/search.png" alt="검색버튼" />
          </button>
        </div>

        {/* 사용자 목록 출력 영역 */}
        <div className={styles.userListContainer}>
          {loading ? (
            <div className={styles.loadingMessage}>
              사용자 목록을 불러오는 중...
            </div>
          ) : (
            <table className={styles.userTable}>
              <thead>
                <tr className={styles.usinglistth}>
                  <th>이름(아이디)</th>
                  <th>남은시간</th>
                </tr>
              </thead>
              <tbody>
                {userList.length > 0 ? (
                  userList.map((user, index) => (
                    <tr key={user.userNo || index} className={styles.userRow}>
                      <td>
                        {(user.username || '이름없음')} ({user.userId || '아이디없음'})
                      </td>
                      <td style={{
                        color: remainSecondsList[index] <= 10 ? "#e74c3c" : "#000000"
                      }}>
                        {formatTime(remainSecondsList[index])}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>
                      사용 중인 회원이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 총 회원 수 표시 */}
        {!loading && userList.length > 0 && (
          <div className={styles.userCount}>
            총 {userList.length}명의 사용중인 회원
          </div>
        )}
      </div>
    </div>
  );
};

export default UsingUserModal;