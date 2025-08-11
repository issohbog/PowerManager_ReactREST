import React, { useState, useEffect } from 'react';
import styles from '../../css/UserModal.module.css';
import { format, set } from 'date-fns';

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
  onResetPassword, // 비밀번호 초기화 함수
  onEdit,
  handle
}) => {
  const [form, setForm] = useState(defaultUser);
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const [animationClass, setAnimationClass] = useState('');     // 모달 애니메이션 상태 추가

  useEffect(() => {
    setForm(user ? { ...defaultUser, ...user } : defaultUser);
  }, [user, open]);

  useEffect(() => {
    if (open) {
      setAnimationClass(styles.fadeIn); // 모달 열릴 때
    } else if (animationClass === styles.fadeIn) {
      setAnimationClass(styles.fadeOut); // 모달 닫힐 때
      setTimeout(() => onClose(), 500); // 애니메이션 종료 후 모달 닫기
    }
  }, [open]);

  const handleAnimationEnd = () => {    
    if (animationClass === styles.fadeOut) {
      onClose(); // 애니메이션이 끝나면 모달 닫기
    }
  };

  if (!open && animationClass !== styles.fadeOut) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isView && onSave) onSave(form);
  };


  return (
    <div className={`${styles.modalOverlay} ${animationClass}`} 
          onAnimationEnd={handleAnimationEnd}>
      <div className={`${styles.modalContent} ${animationClass}`}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            {mode === 'register' && '회원등록'}
            {mode === 'edit' && '회원수정'}
            {mode === 'view' && '회원정보'}
          </span>
          <span className={styles.closeBtn} onClick={() => setAnimationClass(styles.fadeOut)}>×</span>
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
                  value={form.birth ? format(new Date(form.birth), 'yyyy-MM-dd') : ''}
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
            <button 
                type="button" 
                className={styles.btnCancel} 
                onClick={() => setAnimationClass(styles.fadeOut)}>
                  취소
                  </button>
            {!isView && <button type="submit" className={styles.btnSave} id="modal-submit-btn">저장</button>}
            {isEdit && onDelete && (
              <button type="button" className={styles.btnDelete} onClick={() => {
                                                                    if (window.confirm('정말 삭제하시겠습니까?')) {
                                                                      onDelete(form.no); // onDelete 호출
                                                                      setAnimationClass(styles.fadeOut); // 닫기 애니메이션 실행
                                                                    }
                                                                  }}>삭제</button>
            )}
            {isView && (
              <>
                <button
                  type="button"
                  className={styles.btnReset}
                  onClick={() => {
                    if (window.confirm('정말 비밀번호를 초기화하시겠습니까?')) {
                      onResetPassword(user.no); // 비밀번호 초기화 함수 호출
                    }
                  }}
                >
                  비밀번호 초기화
                </button>
                <button
                  type="button"
                  className={styles.btnEdit}
                  onClick={() => onEdit(user)} // 수정 모달로 전환
                >
                  회원정보 수정
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;