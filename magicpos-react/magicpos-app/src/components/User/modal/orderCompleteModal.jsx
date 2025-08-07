import React from 'react';

function OrderCompleteModal({ isOpen, onClose }) {
  
  if (!isOpen) return null;

  return (
    <div 
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onClose}  // 배경 클릭 시 모달 닫기
    >
      <div 
        style={{
          width: '300px',
          height: '400px',
          backgroundColor: '#2C3E50',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        onClick={(e) => e.stopPropagation()}  // 모달 내부 클릭 시 이벤트 버블링 방지
      >
        {/* 상단 여유 공간 */}
        <div style={{ paddingTop: '60px' }}>
          <img 
            src="/images/complete.png" 
            alt="완료" 
            style={{ width: '70px' }} 
          />
          <h3 style={{ 
            marginTop: '20px', 
            fontSize: '20px',
            margin: '20px 0 10px 0'
          }}>
            주문이 완료되었습니다.
          </h3>
          <p style={{ 
            marginTop: '10px', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            주문하신 음식은 곧 자리로 배달됩니다.<br />
            잠시만 기다려 주세요.
          </p>
        </div>

        {/* 확인 버튼 */}
        <div 
          onClick={onClose}
          style={{
            height: '60px',
            backgroundColor: '#F4D03F',
            color: 'black',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#F7DC6F'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#F4D03F'}
        >
          확인
        </div>
      </div>
    </div>
  );
}

export default OrderCompleteModal;
