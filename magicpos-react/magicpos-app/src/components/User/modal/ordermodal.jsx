import React, { useState } from 'react';

function OrderModal({ 
  isOpen = false,
  ongoingOrders = [],
  historyOrders = [],
  orderDetailsMap = {},
  onClose
}) {
  const [activeTab, setActiveTab] = useState('progress'); // 'progress' or 'history'

  if (!isOpen) return null;

  // 주문내역 텍스트 생성
  const getOrderDescription = (orderId) => {
    const details = orderDetailsMap[orderId];
    if (!details || details.length === 0) return '상품 정보 없음';
    
    if (details.length > 1) {
      return `${details[0].p_name} 외 ${details.length - 1}건`;
    }
    return details[0].p_name;
  };

  // 시간 포맷팅
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const EmptyState = ({ message }) => (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <img 
        src="/images/주문내역없음.png" 
        alt="주문내역없음" 
        style={{ width: '100px', marginBottom: '30px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <strong style={{ fontSize: '25px' }}>아직 주문하신 내역이 없습니다.</strong>
        <p style={{ fontSize: '17px', lineHeight: '1.5' }}>
          지금, 메뉴판에서 맛있는 간식을 골라 주문하시면<br />
          주문상황을 확인하실 수 있습니다.
        </p>
      </div>
    </div>
  );

  const OrderTable = ({ orders, showDate = false }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '10px',
      color: '#333',
      height: '430px',
      overflowY: 'auto'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'center', padding: '10px' }}>주문내역</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>결제금액</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>
              {showDate ? '날짜' : '시간'}
            </th>
          </tr>
        </thead>
        <tbody>
          {orders
            .filter(order => orderDetailsMap[order.no])
            .map(order => (
              <tr key={order.no}>
                <td style={{ textAlign: 'center', padding: '10px' }}>
                  {getOrderDescription(order.no)}
                </td>
                <td style={{ textAlign: 'center', padding: '10px' }}>
                  {order.totalPrice?.toLocaleString()}원
                </td>
                <td style={{ textAlign: 'center', padding: '10px' }}>
                  {showDate ? formatDate(order.orderTime) : formatTime(order.orderTime)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '430px',
        height: '700px',
        backgroundColor: '#2C3E50',
        borderRadius: '10px',
        textAlign: 'center',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ padding: '10px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '22px' }}>주문내역</h3>
          
          {/* 탭 버튼 */}
          <div style={{
            display: 'flex',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: 'white',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setActiveTab('progress')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'progress' ? '#F4D03F' : 'white',
                color: activeTab === 'progress' ? 'black' : 'black',
                border: 'none',
                padding: '8px',
                fontSize: '17px',
                cursor: 'pointer'
              }}
            >
              진행중({ongoingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'history' ? '#F4D03F' : 'white',
                color: 'black',
                border: 'none',
                padding: '8px',
                fontSize: '17px',
                cursor: 'pointer'
              }}
            >
              히스토리({historyOrders.length})
            </button>
          </div>

          {/* 진행중 탭 */}
          {activeTab === 'progress' && (
            <div>
              {ongoingOrders.length > 0 ? (
                <OrderTable orders={ongoingOrders} showDate={false} />
              ) : (
                <EmptyState />
              )}
            </div>
          )}

          {/* 히스토리 탭 */}
          {activeTab === 'history' && (
            <div>
              {historyOrders.length > 0 ? (
                <OrderTable orders={historyOrders} showDate={true} />
              ) : (
                <EmptyState />
              )}
            </div>
          )}
        </div>

        {/* 닫기 버튼 */}
        <div
          onClick={onClose}
          style={{
            width: '100%',
            height: '100px',
            backgroundColor: '#F4D03F',
            fontSize: '20px',
            color: '#333333',
            fontWeight: 'bold',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          확인
        </div>
      </div>
    </div>
  );
}

export default OrderModal;