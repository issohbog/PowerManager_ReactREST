import React, { useState } from "react";
import styles from "./css/login.module.css";

const Login = ({ onLogin, error }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    seatId: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin(form);
  };

  return (
    <div className={styles.container}>
      {error === "seatInUse" && (
        <div className={styles.errorMsg}>
          이미 사용 중이거나 고장난 좌석입니다. 다른 좌석을 입력해주세요.
        </div>
      )}

      {/* 상단 로고 */}
      <div className={styles.logoArea}></div>

      {/* 카카오페이 배너 */}
      <div className={styles.banner}>
        <img src="/images/카카오페이.png" alt="카카오페이 배너" />
      </div>

      {/* 하단 로그인 박스 */}
      <div className={styles.loginArea}>
        <div className={styles.loginFormArea}>
          <div className={styles.loginFormLeft}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                placeholder="아이디"
                required
                value={form.username}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="비밀번호"
                required
                value={form.password}
                onChange={handleChange}
              />
              <button type="submit">로그인</button>
              <div className={styles.inputSeatId}>
                <label htmlFor="seatId">좌석번호</label>
                <input
                  type="text"
                  id="seatId"
                  name="seatId"
                  className={styles.seatId}
                  placeholder="예: S1"
                  value={form.seatId}
                  onChange={handleChange}
                />
              </div>
            </form>
            <div className={styles.loginOption}>
              <a href="/users/new" style={{ color: "#f0f0f0", textDecoration: "none" }}>회원가입</a>
              <a href="/find-id" style={{ color: "#f0f0f0", textDecoration: "none" }}>아이디 찾기</a>
              <a href="/find-password" style={{ color: "#f0f0f0", textDecoration: "none" }}>비밀번호 찾기</a>
            </div>
          </div>

          {/* 오른쪽 영역 */}
          <div className={styles.loginFormRight}>
            <div className={styles.ticketPurchaseText}>
              재부팅&nbsp;&nbsp;|&nbsp;&nbsp;PC 종료
            </div>
            <button className={styles.ticketPurchaseBtn}>
              요금제 구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
