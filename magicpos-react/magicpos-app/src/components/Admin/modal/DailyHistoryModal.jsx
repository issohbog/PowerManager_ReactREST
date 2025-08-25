
import React from 'react'
import styles from '../../css/DailyHistoryModal.module.css'

const DailyHistoryModal = ({ visible, seatId, historyData, onClose }) => {
  if (!visible || !historyData) return null

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    const date = new Date(dateTimeString)
    return date.toLocaleString('ko-KR', {
    //   year: 'numeric',
    //   month: '2-digit',
    //   day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>좌석 {seatId} 당일 이용 내역</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          {historyData.history && historyData.history.length > 0 ? (
            <>
              <div className={styles.summary}>
                <span>총 <strong>{historyData.totalCount}건</strong>의 이용 내역</span>
                <span className={styles.date}>{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
              
              <div className={styles.tableContainer}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>순서</th>
                      <th>이름</th>
                      <th>아이디</th>
                      <th>로그인 시각</th>
                      <th>로그아웃 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.history.map((record, index) => (
                      <tr key={record.no} className={styles.historyRow}>
                        <td className={styles.orderNumber}>{index + 1}</td>
                        <td className={styles.username}>{record.username || '-'}</td>
                        <td className={styles.userId}>{record.user_id || '-'}</td>
                        <td className={styles.startTime}>{formatDateTime(record.start_time)}</td>
                        <td className={styles.endTime}>{formatDateTime(record.end_time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={styles.noData}>
              <div className={styles.noDataIcon}>📋</div>
              <p>오늘 이용 내역이 없습니다.</p>
            </div>
          )}
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

export default DailyHistoryModal
