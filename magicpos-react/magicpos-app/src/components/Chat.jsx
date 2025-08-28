import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "./css/chat.module.css";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import MacroSelect from "./MacroSelect";
import { useChat } from "../contexts/ChatContext";


function Header({ title, extra }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTitle}>{title}</div>
      {extra}
    </div>
  );
}

function Bubble({ message, self }) {
  const isCounter = message.from === "counter";
  const bubbleClass = isCounter ? styles.bubbleCounter : styles.bubbleCustomer;
  const alignStyle = { justifyContent: self ? "flex-end" : "flex-start", display: "flex", alignItems: "flex-end" };

  function formatTime(ts) {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={alignStyle}>
      {/* 내가 보낸 메시지: 시간 왼쪽 */}
      {self && (
        <span style={{ fontSize: "0.75em", color: "#888", marginRight: 8, alignSelf: "flex-end" }}>
          {formatTime(message.at)}
        </span>
      )}
      <div className={`${styles.bubble} ${bubbleClass}`}>
        {message.text}
      </div>
      {/* 상대방이 보낸 메시지: 시간 오른쪽 */}
      {!self && (
        <span style={{ fontSize: "0.75em", color: "#888", marginLeft: 8, alignSelf: "flex-end" }}>
          {formatTime(message.at)}
        </span>
      )}
    </div>
  );
}

function MessageList({ items, selfRole }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [items.length]);

  return (
    <div ref={ref} className={styles.messageList}>
      {items.map((m) => (
        <Bubble key={m.id} message={m} self={m.from === selfRole} />
      ))}
    </div>
  );
}

function InputBar({ value, onChange, onSend }) {
  const handleSend = () => onSend(value);
  const onKey = (e) => {
    if (e.key === "Enter") handleSend();
  };
  return (
    <div className={styles.inputBar}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        placeholder="메시지를 입력하세요"
        className={styles.input}
      />
      <button onClick={handleSend} className={styles.sendButton}>
        전송
      </button>
    </div>
  );
}

// ChatWindow에서 context의 messages/send/channel/chatSeat만 사용
function ChatWindow({ role, title = "메시지" }) {
  const { messages, send, channel, chatSeat } = useChat();
  const [draft, setDraft] = useState("");

  // 채널 결정 (사용자: channel, 관리자: chatSeat?.seatId)
  const chatChannel = role === "counter" ? (chatSeat?.seatId || "S1") : channel;

  const headerExtra = role === "counter" ? (
    <MacroSelect onPick={(s) => setDraft(s)} />
  ) : undefined;

  // 해당 채널의 메시지만 필터링
  const filteredMessages = messages.filter(m => m.channel === chatChannel);

  // console.log("관리자 chatSeat:", chatSeat);
  // console.log("관리자 chatChannel:", chatChannel);
  // console.log("관리자 filteredMessages:", filteredMessages);
  // console.log("전체 messages:", messages);

  return (
    <div className={styles.window}>
      <Header title={title} extra={headerExtra} />
      <MessageList items={filteredMessages} selfRole={role} />
      <InputBar
        value={draft}
        onChange={setDraft}
        onSend={(v) => {
          send(v, role);
          setDraft("");
        }}
      />
    </div>
  );
}

export function UserChat({ title = "메시지" }) {
  return (
    <div className={styles.container}>
      <div className={styles.grid2}>
        <div>
          <div>사용자 ▶ 카운터</div>
          <ChatWindow role="customer" title={title} />
        </div>
      </div>
    </div>
  );
}

export function AdminChat({ title = "메시지" }) {
  return (
    <div className={styles.container}>
      <div className={styles.grid2}>
        <div>
          <div>카운터 ▶ 사용자</div>
          <ChatWindow role="counter" title={title} />
        </div>
      </div>
    </div>
  );
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
