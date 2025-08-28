// ChatNotification.jsx
import React, { useEffect, useRef } from "react";
import { useChat } from "../contexts/ChatContext";

function ChatNotification() {
  const {
    notification,
    setNotification,
    selfRole: ctxSelfRole, // ← ChatContext에서 제공 (없으면 아래서 폴백)
  } = useChat();

  // 컨텍스트 기반 역할(없으면 customer)
  const selfRole = (ctxSelfRole || "customer").toLowerCase();

  // 같은 알림 중복 방지
  const lastIdRef = useRef(null);

  // 알림 사운드(재사용)
  const audioRef = useRef(null);
  if (!audioRef.current) {
    audioRef.current = new Audio("/sounds/notify.mp3");
    audioRef.current.preload = "auto";
  }

  useEffect(() => {
    if (!notification) return;

    const { id, from } = notification;

    // 내가 보낸 건 알림 X
    if ((from || "").toLowerCase() === selfRole) {
      setNotification(null);
      return;
    }

    // 같은 알림 두 번 울리지 않기
    if (lastIdRef.current === id) return;
    lastIdRef.current = id;

    // 사운드 재생 (오토플레이 정책 예외 무시)
    const play = async () => {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (e) {
        // console.debug("Autoplay blocked", e);
      }
    };
    play();
  }, [notification, selfRole, setNotification]);

  if (!notification || (notification.from || "").toLowerCase() === selfRole) {
    return null;
  }

  const seatLabel = notification.channel
    ? ` 좌석${String(notification.channel).replace(/^S/, "")}`
    : "";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "#334155",
        color: "#fff",
        padding: "16px 20px",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        zIndex: 9999,
        maxWidth: 320,
        lineHeight: 1.4,
      }}
      role="status"
      aria-live="polite"
    >
      <strong style={{ display: "block", marginBottom: 6 }}>
        {selfRole === "counter"
          ? seatLabel
          : " 카운터"}
      </strong>
      <div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
        {notification.text}
      </div>
      <button
        style={{
          marginTop: 10,
          background: "#64748b",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          padding: "6px 12px",
          cursor: "pointer",
          float: "right"
        }}
        onClick={() => setNotification(null)}
      >
        닫기
      </button>
    </div>
  );
}

export default ChatNotification;
