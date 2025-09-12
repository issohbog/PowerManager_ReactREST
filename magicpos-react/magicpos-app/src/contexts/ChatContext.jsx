import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

export const ChatContext = createContext();
export function useChat() {
  return useContext(ChatContext);
}

export function ChatContextProvider({ children }) {
  const [chatSeat, setChatSeat] = useState(null);
  const [channel, setChannel] = useState("admin");
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState(null);
  const [adminChannels, setAdminChannels] = useState([]); // 관리자가 구독할 좌석 채널 배열
  const [selfRole, setSelfRole] = useState("customer"); // 기본값은 "customer" 또는 "counter"
  const stompRef = useRef(null);

  useEffect(() => {
    const stompClient = new Client({
      // brokerURL: `ws://${window.location.hostname}:8080/ws`,
      brokerURL: 'wss://powermanager159.cafe24.com/ws',
      reconnectDelay: 5000,
      debug: (s) => console.log(s),
    });

    stompClient.onConnect = () => {
      // 사용자: channel 하나만 구독
      stompClient.subscribe(`/topic/chat/${channel}`, (message) => {
        try {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
          setNotification(msg); // 알림도 여기서 관리
        } catch {}
      });

      // 관리자: 여러 좌석 채널 구독
      adminChannels.forEach(seatId => {
        stompClient.subscribe(`/topic/chat/${seatId}`, (message) => {
          try {
            const msg = JSON.parse(message.body);
            setMessages((prev) => [...prev, msg]);
            setNotification(msg); // 알림도 여기서 관리
          } catch {}
        });
      });
    };

    stompClient.activate();
    stompRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [channel, adminChannels]);

  const send = (text, selfRole) => {
    // counter면 chatSeat?.seatId, 아니면 channel 사용
    const targetChannel = selfRole === "counter"
      ? (chatSeat?.seatId || channel)
      : channel;

    const msg = {
      id: uuid(),
      channel: targetChannel,
      from: selfRole,
      text: (text || "").trim(),
      at: Date.now(),
    };
    if (!msg.text) return;
    if (stompRef.current && stompRef.current.connected) {
      stompRef.current.publish({
        destination: `/app/chat/${targetChannel}`,
        body: JSON.stringify(msg),
      });
    }
  };

  return (
    <ChatContext.Provider value={{
      chatSeat,
      setChatSeat,
      channel,
      setChannel,
      messages,
      send,
      notification,
      setNotification,
      adminChannels,
      setAdminChannels,
      selfRole,
      setSelfRole // 추가!
    }}>
      {children}
    </ChatContext.Provider>
  );
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}