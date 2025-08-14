import React from 'react';
import '../../css/admin_usinguser.css';

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

  // 모달이 보이지 않으면 렌더링하지 않음
  if (!isVisible) return null;

  // 모달 외부 클릭 시 닫기
  const handleModalClick = (e) => {
    if (e.target.classList.contains('usingmodal')) {
      onClose();
    }
  };

  function formatTime(minutes) {
    if (minutes == null) return '없음';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  }

  return (
    <div className="usingmodal" onClick={handleModalClick}>
      <div className="usingmodal-content">
        {/* 닫기 버튼 */}
        <span className="usingclose" onClick={onClose}>&times;</span>

        {/* 🔍 검색창 */}
        <div className="using-search-box">
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
        <div className="user-list-container">
          {loading ? (
            <div className="loading-message">
              사용자 목록을 불러오는 중...
            </div>
          ) : (
            <table className="user-table">
              <thead>
                <tr className="usinglistth">
                  <th>이름(아이디)</th>
                  <th>남은시간</th>
                </tr>
              </thead>
              <tbody>
                {userList.length > 0 ? (
                  userList.map((user, index) => (
                    <tr key={user.userNo || index} className="user-row">
                      <td>
                        {(user.username || '이름없음')} ({user.userId || '아이디없음'})
                      </td>
                      <td style={{
                        color: user.remain_time <= 10 ? "#e74c3c" : "#000000"
                      }}>
                        {formatTime(user.remain_time)}
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
          <div className="user-count">
            총 {userList.length}명의 사용중인 회원
          </div>
        )}
      </div>
    </div>
  );
};

export default UsingUserModal;