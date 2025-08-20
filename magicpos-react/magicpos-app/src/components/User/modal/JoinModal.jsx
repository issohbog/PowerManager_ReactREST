import React, { useState } from "react";
import styles from "../../css/JoinModal.module.css"; // CSS Module

/* Presentational JoinModal: 모든 상태/검증은 컨테이너에서 관리 */
const JoinModal = ({
  onClose,
  onSubmit,
  errors = {},
  submitting = false,
  form = {},
  onChange,
  onBlur,
  onSelectGender
  // idChecking,
  // idAvailable
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    onChange && onChange(name, value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit && onSubmit(form)
  }

  const accountErrorList = [errors.id, errors.password].filter(Boolean)
  const personalErrorList = [errors.username, errors.birth, errors.gender, errors.email, errors.phone].filter(Boolean)

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.userSignupBody}>
        <div className={styles.userSignupContainer}>
          <button className={styles.modalCloseBtn} onClick={onClose}>×</button>
          <h2 className={styles.userSignupTitle}>Sign Up</h2>
          <form id="signupForm" onSubmit={handleSubmit}>
            <div className={`${styles.userSignupGroup} ${styles.userSignupBox}`}>
              <div className={styles.userSignupFormGroup}>
                <div className={styles.userSignupIdWrap}>
                  <input
                    type="text"
                    id="userSignupId"
                    name="id"
                    placeholder="아이디"
                    value={form.id || ''}
                    onChange={handleInputChange}
                    onBlur={() => onBlur && onBlur('id')}
                  />
                  {/* {idChecking && <span className={styles.userSignupChecking}>확인중...</span>}
                  {idAvailable === true && !errors.id && <span className={styles.userSignupOk}>사용가능</span>}
                  {idAvailable === false && errors.id && <span className={styles.userSignupFail}>중복</span>} */}
                </div>
              </div>
              <div className={`${styles.userSignupFormGroup} ${styles.userSignupPasswordWrap}`}>
                <div className={styles.userSignupPasswordBox}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="userSignupPassword"
                    name="password"
                    placeholder="비밀번호"
                    value={form.password || ''}
                    onChange={handleInputChange}
                    onBlur={() => onBlur && onBlur('password')}
                  />
                  <button
                    type="button"
                    className={styles.userSignupEyeBtn}
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >👁️</button>
                </div>
              </div>
              <ul className={styles.userSignupErrorList}>
                {accountErrorList.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>

            <div className={styles.userSignupDivider}></div>

            <div className={`${styles.userSignupGroup} ${styles.userSignupBox}`}>
              <div className={styles.userSignupFormGroup}>
                <input
                  type="text"
                  id="userSignupName"
                  name="username"
                  placeholder="이름"
                  value={form.username || ''}
                  onChange={handleInputChange}
                  onBlur={() => onBlur && onBlur('username')}
                />
              </div>
              <div className={styles.userSignupFormGroup}>
                <input
                  type="text"
                  id="userSignupBirth"
                  name="birth"
                  placeholder="생년월일 (8자리: YYYYMMDD)"
                  value={form.birth || ''}
                  onChange={handleInputChange}
                  onBlur={() => onBlur && onBlur('birth')}
                />
              </div>
              <div className={`${styles.userSignupFormGroup} ${styles.userSignupGenderButtons}`}>
                <button
                  type="button"
                  className={
                    styles.userSignupGenderBtn + (form.gender === 'M' ? ' ' + styles.userSignupGenderBtnSelected : '')
                  }
                  onClick={() => { onSelectGender && onSelectGender('M') ; onBlur && onBlur('gender') }}
                >남자</button>
                <button
                  type="button"
                  className={
                    styles.userSignupGenderBtn + (form.gender === 'F' ? ' ' + styles.userSignupGenderBtnSelected : '')
                  }
                  onClick={() => { onSelectGender && onSelectGender('F') ; onBlur && onBlur('gender') }}
                >여자</button>
              </div>
              <input type="hidden" id="userSignupGender" name="gender" value={form.gender} />
              <div className={styles.userSignupFormGroup}>
                <input
                  type="email"
                  id="userSignupEmail"
                  name="email"
                  placeholder="이메일"
                  value={form.email || ''}
                  onChange={handleInputChange}
                  onBlur={() => onBlur && onBlur('email')}
                />
              </div>
              <div className={styles.userSignupFormGroup}>
                <input
                  type="text"
                  id="userSignupPhone"
                  name="phone"
                  placeholder="휴대폰 번호 (01012345678)"
                  value={form.phone || ''}
                  onChange={handleInputChange}
                  onBlur={() => onBlur && onBlur('phone')}
                />
              </div>
              <ul className={styles.userSignupErrorList}>
                {personalErrorList.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
            {errors.global && <div className={styles.userSignupErrorList} style={{ listStyle: 'none' }}>{errors.global}</div>}
            <button type="submit" className={styles.userSignupSubmitBtn} disabled={submitting}>
              {submitting ? '처리중...' : '가입하기'}
            </button>
          </form>
          <div className={styles.tologin}>
            <span>이미 가입 하셨나요? </span>
            <a href="/login">로그인</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinModal;