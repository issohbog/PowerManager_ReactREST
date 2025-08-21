// components/Admin/UserInfoModal.jsx
import React from 'react'
import styles from '../../css/UserInfoModal.module.css'

// 좌석 우클릭 시 회원 정보 조회 컴포넌트
const UserInfoModal = ({ visible, userInfo, onClose }) => {
  if (!visible || !userInfo) return null

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatTime = (minutes) => {
    if (minutes == null) return '0분'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins}분`
    }
    return `${mins}분`
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>회원 정보</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <label>회원번호:</label>
              <span>{userInfo.user?.no || '-'}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>아이디:</label>
              <span>{userInfo.user?.id || '-'}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>이름:</label>
              <span>{userInfo.user?.username || '-'}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>생년월일:</label>
              <span>{formatDate(userInfo.user?.birth)}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>성별:</label>
              <span>{userInfo.user?.gender === 'M' ? '남성' : userInfo.user?.gender === 'F' ? '여성' : '-'}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>이메일:</label>
              <span>{userInfo.user?.email || '-'}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>전화번호:</label>
              <span>{userInfo.user?.phone || '-'}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>메모:</label>
              <span>{userInfo.user?.memo || '-'}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>가입일:</label>
              <span>{formatDate(userInfo.user?.createdAt)}</span>
            </div>
            
            <div className={styles.divider}></div>
            
            <div className={styles.infoRow}>
              <label>남은 시간:</label>
              <span className={styles.remainTime}>{formatTime(userInfo.remainTime)}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>사용한 시간:</label>
              <span className={styles.usedTime}>{formatTime(userInfo.usedTime)}</span>
            </div>
            
            <div className={styles.infoRow}>
              <label>활성 상태:</label>
              <span className={userInfo.user?.enabled ? styles.enabled : styles.disabled}>
                {userInfo.user?.enabled ? '활성' : '비활성'}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <button className={styles.confirmButton} onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserInfoModal
