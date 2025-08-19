import React, { useEffect, useState } from "react";
import axios from 'axios';
import UserHeader from "../../components/User/userheader";
import { getMenu } from "../../apis/menu";  // ✅ 기존 함수 재사용

// 사용자 헤더 정보를 불러와서 UserHeader에 전달하는 컨테이너 컴포넌트
function UserHeaderContainer({ 
    usageInfo, setUsageInfo,
    usedTime, setUsedTime,
    remainTime, setRemainTime,
    onOpenTicketModal }) {

  // 예시: /menu API에서 사용자 정보와 시간 데이터 받아오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 API 호출 시작");
        const response = await getMenu();  // ✅ 이미 /api/menu로 요청됨
        console.log("📦 받아온 데이터:", response.data);
        
        setUsageInfo(response.data.usageInfo);
        setUsedTime(response.data.usedTime);
        setRemainTime(response.data.remainTime);
        
      } catch (error) {
        console.error("❌ API 호출 실패:", error);
      }
    };

    fetchData();
  }, []);

  // 로그아웃 핸들러 예시 (POST /logout)
  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      window.location.href = "/login";
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };

  return (
    <UserHeader
      usageInfo={usageInfo}
      usedTime={usedTime}
      remainTime={remainTime}
      onLogout={handleLogout}
      onOpenTicketModal={onOpenTicketModal}
    />
  );
}

export default UserHeaderContainer;
