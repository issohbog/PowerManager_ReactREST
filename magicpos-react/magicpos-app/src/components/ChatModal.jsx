import React from "react";

const ChatModal = ({ open, onClose, title = "메시지", children }) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "grid", placeItems: "center", zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{ width: 380, borderRadius: 12, overflow: "hidden", background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          background: "#1e293b", color: "#fff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 12px"
        }}>
          <strong>{title}</strong>
          <button onClick={onClose}
            style={{ background: "transparent", color: "#fff", border: 0, fontSize: 18, cursor: "pointer" }}>
            ✕
          </button>
        </div>
        <div style={{ background: "#0f172a" /* ChatWindow 배경색과 맞춤 */ }}>
          {children}
        </div>
      </div>
    </div>
  );
}
export default ChatModal;