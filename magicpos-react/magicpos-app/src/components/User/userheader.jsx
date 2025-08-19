import React, { useState, useEffect } from "react";

function UserHeader({ usageInfo, usedTime, remainTime, onLogout, onOpenTicketModal }) {
  // 분을 초로 변환해서 상태 관리
  const [usedSeconds, setUsedSeconds] = useState((usedTime || 0) * 60);
  const [remainSeconds, setRemainSeconds] = useState((remainTime || 0) * 60);

  // props가 변경될 때 state 업데이트 (분 → 초 변환)
  useEffect(() => {
    setUsedSeconds((usedTime || 0) * 60);
    setRemainSeconds((remainTime || 0) * 60);
  }, [usedTime, remainTime]);

  // 타이머 로직 - 1초마다 실행
  useEffect(() => {
    const timer = setInterval(() => {
      setUsedSeconds(prev => prev + 1);  // 사용시간 1초씩 증가
      setRemainSeconds(prev => Math.max(0, prev - 1));  // 남은시간 1초씩 감소
    }, 1000);  // ✅ 1초 = 1000ms마다 실행

    return () => clearInterval(timer);  // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  // 초를 시:분:초 형태로 변환
  const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return "만료됨";
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ width: "100%", height: "100px", backgroundColor: "#2b3e50", color: "white", display: "flex" }}>
      <div style={{ width: "80%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 0", gap: "10px" }}>
        {/* 상단 ID 영역 */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 20px", fontSize: "15px" }}>
          ID <span>{usageInfo?.username || "user123"}</span> |
          <a href="/user/info" style={{ color: "#ffffff", textDecoration: "underline", marginLeft: "5px" }}>회원정보수정</a>
        </div>

        {/* 하단 버튼 + 정보 영역 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
          {/* 왼쪽 버튼 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => window.location.href = "/menu"}
              style={{ width: "120px", height: "50px", fontSize: "18px", borderRadius: "5px", backgroundColor: "#f1c40f", border: "none", fontWeight: "bold" }}
            >
              먹거리 주문
            </button>
            <button
              style={{ width: "120px", height: "50px", fontSize: "18px", borderRadius: "5px", backgroundColor: "#f1c40f", border: "none", fontWeight: "bold" }}
              onClick={onOpenTicketModal}
            >
              요금제 구매
            </button>
            <button style={{ width: "120px", height: "50px", fontSize: "18px", borderRadius: "5px", backgroundColor: "#f1c40f", border: "none", fontWeight: "bold" }}>
              메세지
            </button> 
          </div>

          {/* 오른쪽 정보박스 */}
          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ width: "100px", height: "60px", backgroundColor: "#1e2b38", padding: "5px 10px", borderRadius: "5px", textAlign: "center", fontSize: "16px" }}>
              <span style={{ fontSize: "13px" }}>자리번호</span><br />
              <strong>{`no. ${usageInfo?.seat_id || "50"}`}</strong>
            </div>
            <div style={{ width: "100px", height: "60px", backgroundColor: "#1e2b38", padding: "5px 10px", borderRadius: "5px", textAlign: "center", fontSize: "16px" }}>
              <span style={{ fontSize: "13px" }}>사용시간</span><br />
              <strong>{formatTime(usedSeconds)}</strong>
            </div>
            <div style={{ width: "100px", height: "60px", backgroundColor: "#1e2b38", padding: "5px 10px", borderRadius: "5px", textAlign: "center", fontSize: "16px" }}>
              <span style={{ fontSize: "13px" }}>남은시간</span><br />
              <strong style={{ color: remainSeconds <= 600 ? "#e74c3c" : "#f1c40f" }}>
                {formatTime(remainSeconds)}
              </strong>
            </div>
            <div style={{ width: "100px", height: "60px", backgroundColor: "#1e2b38", padding: "5px 10px", borderRadius: "5px", textAlign: "center", fontSize: "16px" }}>
              <button
                onClick={onLogout}
                style={{ all: "unset", fontSize: "13px", cursor: "pointer" }}
              >
                <span>사용종료</span><br />
                <img src="/images/전원.png" style={{ width: "23px", marginTop: "5px" }} alt="logout" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHeader;