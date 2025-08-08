import React, { useState, useEffect } from 'react';
import styles from '../../css/UserModal.module.css';

const defaultUser = {
  username: '',
  id: '',
  gender: 'M',
  memo: '',
  birth: '',
  phone: '',
  email: '',
  usedMin: 0,
  remainMin: 0,
};

const UserModal = ({
  open,
  mode, // 'register' | 'edit' | 'view'
  user,
  onClose,
  onSave,
  onDelete,
  onIdCheck,
  idCheckMessage,
  idCheckStatus, // 'error' | 'success'
  handle
}) => {
  const [form, setForm] = useState(defaultUser);
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  useEffect(() => {
    setForm(user ? { ...defaultUser, ...user } : defaultUser);
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isView && onSave) onSave(form);
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            {mode === 'register' && '회원등록'}
            {mode === 'edit' && '회원수정'}
            {mode === 'view' && '회원정보'}
          </span>
          <span className={styles.closeBtn} onClick={onClose}>×</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={`${styles.modalBody} ${styles.twoColumns} ${styles.withDivider}`}>
            {/* 왼쪽 */}
            <div className={styles.leftColumn}>
              <div className={styles.formRow}>
                <label htmlFor="username">이름</label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={form.username}
                  onChange={handleChange}
                  readOnly={isView}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="id">아이디</label>
                <div className={styles.inlineField} id="id-input-wrapper">
                  <input
                    type="text"
                    name="id"
                    id="user-id"
                    value={form.id}
                    onChange={handleChange}
                    readOnly={isEdit || isView}
                    required
                  />
                  {mode === 'register' && (
                    <button type="button" id="id-check-btn" onClick={() => onIdCheck && onIdCheck(form.id)}>
                      중복확인
                    </button>
                  )}
                </div>
                {mode === 'register' && (
                <div
                    id="id-check-message"
                    className={`${styles.formMessage} ${idCheckStatus ? styles[idCheckStatus] : ''}`}
                  >
                  {idCheckMessage}
                </div>
                )}
              </div>
              <div className={styles.formRow}>
                <label>성별</label>
                <div className={styles.radioGroup}>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="M"
                      checked={form.gender === 'M'}
                      onChange={handleChange}
                      disabled={isView}
                    /> 남자
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="F"
                      checked={form.gender === 'F'}
                      onChange={handleChange}
                      disabled={isView}
                    /> 여자
                  </label>
                </div>
              </div>
              <div className={styles.formRow}>
                <label>메모</label>
                <textarea
                  name="memo"
                  id="memo"
                  value={form.memo}
                  onChange={handleChange}
                  readOnly={isView}
                />
              </div>
            </div>
            {/* 오른쪽 */}
            <div className={styles.rightColumn}>
              <div className={styles.formRow}>
                <label>생년월일</label>
                <input
                  type="date"
                  name="birth"
                  id="birth"
                  value={form.birth || ''}
                  onChange={handleChange}
                  readOnly={isView}
                />
              </div>
              <div className={styles.formRow}>
                <label>전화번호</label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={form.phone}
                  onChange={handleChange}
                  readOnly={isView}
                />
              </div>
              <div className={styles.formRow}>
                <label>이메일</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  readOnly={isView}
                />
              </div>
              <div className={styles.formRow}>
                <label>사용시간</label>
                <div className={styles.inlineField}>
                  <input
                    type="number"
                    name="usedMin"
                    id="usedMin"
                    value={form.usedMin}
                    min={0}
                    disabled
                  />
                  <span>분</span>
                </div>
              </div>
              <div className={styles.formRow}>
                <label>남은시간</label>
                <div className={styles.inlineField}>
                  <input
                    type="number"
                    name="remainMin"
                    id="remainMin"
                    value={form.remainMin}
                    min={0}
                    disabled
                  />
                  <span>분</span>
                </div>
              </div>
            </div>
            <div className={styles.divider}></div>
          </div>
          <div className={styles.modalFooter} id="modal-footer">
            <button type="button" className={styles.btnCancel} onClick={onClose}>취소</button>
            {!isView && <button type="submit" className={styles.btnSave} id="modal-submit-btn">저장</button>}
            {isEdit && onDelete && (
              <button type="button" className={styles.btnDelete} onClick={() => onDelete(form.no)}>삭제</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;