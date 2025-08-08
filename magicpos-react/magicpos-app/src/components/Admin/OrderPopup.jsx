import React, { useState } from 'react';
import '../css/admin_modal.css';

const OrderPopup = ({ 
  isVisible, 
  onClose, 
  orderList = [], 
  orderCount = 0, 
  preparingCount = 0,
  menuNamesMap = {},
  onStatusUpdate,
  onTabChange,
  onCancelOrderClick  
}) => {
  
  // ✅ UI 상태만 관리
  const [activeTab, setActiveTab] = useState('all');

  // ✅ 팝업이 보이지 않으면 렌더링하지 않음
  if (!isVisible) return null;

  // ✅ 유틸리티 함수들 (UI 관련)
  const calculateWaitTime = (orderTime) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));
    return diffInMinutes;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\. /g, '/').replace(/\.$/, '');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  // ✅ 거스름돈 계산 함수 추가
  const calculateChange = (order) => {
    // 현금 결제인 경우에만 거스름돈 계산
    if (order.payment !== '현금' && order.payment !== 'CASH') {
      return null;
    }
    
    // cashAmount가 있는 경우 거스름돈 계산
    const cashAmount = order.cashAmount || 0;
    const totalPrice = order.totalPrice || 0;
    const change = cashAmount - totalPrice;
    
    // 거스름돈이 0 이상인 경우에만 표시
    return change >= 0 ? change : null;
  };

  const getMenuNames = (order) => {
    if (menuNamesMap[order.no]) {
      return menuNamesMap[order.no];
    }
    
    if (order.menuNames) {
      return order.menuNames;
    }
    
    return '메뉴 정보 없음';
  };

  // ✅ 탭 변경 (UI 상태 + 부모 알림)
  const handleTabChange = (status) => {
    console.log('🎯 탭 변경:', status);
    setActiveTab(status);
    
    if (onTabChange) {
      onTabChange(status);
    }
  };

  // ✅ 주문 상태 변경 (부모에게 위임)
  const handleStatusChange = (orderNo, newStatus) => {
    console.log('🔄 상태 변경:', orderNo, newStatus);
    if (onStatusUpdate) {
      onStatusUpdate(orderNo, newStatus);
    }
  };

  // ✅ 판매취소 클릭 - 바로 모달 열기
  const handleCancelClick = (order) => {
    console.log('🎯 판매취소 클릭 - 바로 모달 열기:', order.no);
    if (onCancelOrderClick) {
      onCancelOrderClick(order, 'update');
    }
  };

  // ✅ 주문 필터링 (UI 로직)
  const getFilteredOrders = () => {
    if (activeTab === 'all') {
      return orderList;
    } else if (activeTab === '1') {
      return orderList.filter(order => order.orderStatus === 1);
    }
    return orderList;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <>
      {/* ✅ 주문 팝업 */}
      <div className="order-popup-overlay">
        <div className="order-popup-box">
          <div className="order-status-container">
            
            {/* ✅ 헤더 탭 */}
            <div className="order-status-header">
              <button
                className={`number-tab1 ${activeTab === 'all' ? 'active-tab' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                주문현황 <span>{String(orderCount).padStart(2, '0')}</span>
              </button>

              <button
                className={`number-tab2 ${activeTab === '1' ? 'active-tab' : ''}`}
                onClick={() => handleTabChange('1')}
              >
                준비중 <span>{String(preparingCount).padStart(2, '0')}</span>
              </button>

              <button className="close-btn" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* ✅ 주문 리스트 */}
            <div className="order-list">
              {filteredOrders.length === 0 ? (
                <div className="no-orders">
                  {activeTab === '1' ? '준비중인 주문이 없습니다.' : '주문이 없습니다.'}
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const waitTime = calculateWaitTime(order.orderTime);
                  const change = calculateChange(order); // ✅ 거스름돈 계산
                  
                  return (
                    <div key={order.no} className="order-card">
                      <div className="order-card-inner">
                        
                        <div className="order-time-box">
                          <div className="seat-no">{order.seatId}</div>
                          <div className="action-btn">판매하기</div>
                        </div>

                        <div className="order-detail-box">
                          <span className="menu-names">
                            {getMenuNames(order)}
                          </span>

                          <div className="status-row1">
                            <div className="memo">{order.message || ''}</div>
                            <span 
                              className="sell-cancel"
                              onClick={() => onCancelOrderClick(order, 'update')}
                            >
                              판매취소
                            </span>
                          </div>

                          <div className="status-row2">
                            <div className="price-box">
                              <span className="price">{formatPrice(order.totalPrice)}</span>
                              <span className="paytype">({order.payment})</span>
                              {order.paymentStatus === 1 && (
                                <span className="paid-text">결제완료</span>
                              )}
                              {/* ✅ 거스름돈 표시 추가 */}
                              {change !== null && change > 0 && (
                                <span className="change-text">
                                  거스름돈: {formatPrice(change)}
                                </span>
                              )}
                            </div>

                            <div className="status-badges">
                              <span
                                className={`badge preparing ${order.orderStatus === 1 ? 'active' : ''}`}
                                onClick={() => handleStatusChange(order.no, 1)}
                              >
                                준비중
                              </span>
                              <span
                                className={`badge complete ${order.orderStatus === 2 ? 'active' : ''}`}
                                onClick={() => handleStatusChange(order.no, 2)}
                              >
                                전달완료
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="order-card-footer">
                        {waitTime > 0 && (
                          <div className={`wait-time ${waitTime > 30 ? 'red-text' : ''}`}>
                            <span>⏱ {waitTime}분 경과</span>
                          </div>
                        )}
                        <span className="time">{formatDate(order.orderTime)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderPopup;
