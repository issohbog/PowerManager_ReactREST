import { useEffect, useState } from "react";
import { fetchMacros, createMacro, deleteMacro } from "../apis/chat";
import styles from "../components/css/MacroSelect.module.css";

function MacroSelect({ onPick }) {
  const [macros, setMacros] = useState([]);
  const [input, setInput] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState("");

  // 매크로 목록 불러오기
  useEffect(() => {
    fetchMacros().then(data => setMacros(data));
  }, []);

  // 매크로 추가
  const handleAdd = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const macro = await createMacro(text);
    setMacros((prev) => [...prev, macro]);
    setInput("");
    setShowAdd(false);
  };

  // 매크로 삭제
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteTarget) return;
    await deleteMacro(deleteTarget);
    setMacros((prev) => prev.filter(m => String(m.no) !== String(deleteTarget)));
    setDeleteTarget("");
    setShowDelete(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonRow}>
        <button type="button" className={styles.actionBtn} onClick={() => { setShowAdd(v => !v); setShowDelete(false); }}>
          매크로 추가
        </button>
        <button type="button" className={styles.actionBtn} onClick={() => { setShowDelete(v => !v); setShowAdd(false); }}>
          매크로 삭제
        </button>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className={styles.formRow}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="매크로 추가 후 엔터"
            className={styles.input}
            autoFocus
          />
          <button type="submit" className={styles.submitBtn}>추가</button>
        </form>
      )}
      {showDelete && (
        <form onSubmit={handleDelete} className={styles.formRow}>
          <select
            value={deleteTarget}
            onChange={e => setDeleteTarget(e.target.value)}
            className={styles.select2}
          >
            <option value="">삭제할 매크로 선택</option>
            {macros.map((m) => (
              <option key={m.no} value={m.no}>{m.text_message}</option>
            ))}
          </select>
          <button type="submit" className={styles.submitBtn}>삭제</button>
        </form>
      )}
      {/* 추가/삭제 폼이 열려있지 않을 때만 매크로 선택 셀렉트 표시 */}
      {!showAdd && !showDelete && (
        <select
          onChange={e => onPick(e.target.value)}
          defaultValue=""
          className={styles.select1}
        >
          <option value="" disabled>매크로 선택</option>
          {macros.map((m) => (
            <option key={m.no} value={m.text_message}>
              {m.text_message}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default MacroSelect;