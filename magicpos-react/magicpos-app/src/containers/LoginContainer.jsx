import React, { useState } from "react";
import { login } from "../apis/login"; // login.js에서 export한 login 함수 사용
import { useNavigate } from "react-router-dom"; 
import Login from "../components/Login";

const LoginContainer = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleLogin = async (form) => {
  try {
    const response = await login(form.username, form.password, form.seatId);
    console.log("📦 로그인 응답:", response.data);

    if (response.data?.token) {
      const { token, user } = response.data;

      // 토큰 저장
      localStorage.setItem("jwt", token);

      // 로그인 성공 후 추가 작업 실행
      await handleLoginSuccess({
        token,
        id: user.id,
        seatId: form.seatId,
        rememberId: form.rememberId // 필요시
      });

      // 권한 분기
      if (user.roles.includes("ROLE_ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/menu");
      }
    } else if (response.data?.error === "seatInUse") {
      setError("seatInUse");
    } else {
      setError("loginFail");
    }
  } catch (e) {
    console.error("❌ 로그인 에러:", e);
    setError("loginFail");
  }
};

// 로그인 성공 시
const handleLoginSuccess = async (loginResponse) => {
  // JWT 토큰 저장
  localStorage.setItem("token", loginResponse.token);

  // 로그인 직후 추가 요청
  const afterLoginBody = {
    id: loginResponse.id,           // 로그인한 아이디
    seatId: loginResponse.seatId,         // 필요시
    rememberId: loginResponse.rememberId   // "on" 또는 true
  };

  await fetch("/api/auth/after-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${loginResponse.token}` // JWT 토큰 포함
    },
    body: JSON.stringify(afterLoginBody)
  })
  .then(res => res.json())
  .then(data => {
    // 처리 결과에 따라 리다이렉트 등 추가 작업
    if (data.success) {
      window.location.href = data.redirect;
    } else {
      alert(data.message);
    }
  });
};


  return <Login onLogin={handleLogin} error={error} />;
};

export default LoginContainer;