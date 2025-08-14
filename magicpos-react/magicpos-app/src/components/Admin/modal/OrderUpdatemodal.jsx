import React, { useState, useEffect, useMemo } from 'react';
import '../../css/cancel_modal.css';

const OrderUpdateModal = ({ 
  isVisible, 
  onClose, 
  order = null,
  orderDetails = [],
  onQuantityChange,
  onDeleteItem,
  onDeleteOrder
}) => {
  
  const [loading, setLoading] = useState(false);
  
  // ✅ 확인 모달 상태 추가
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // ✅ 실시간 총 금액 계산 (orderDetails 변경 시 자동 재계산)
  const currentTotalPrice = useMemo(() => {
    if (!orderDetails || orderDetails.length === 0) {
      return 0;
    }
    
    return orderDetails.reduce((total, item) => {
      const itemPrice = (item.p_price || 0) * (item.quantity || 0);
      return total + itemPrice;
    }, 0);
  }, [orderDetails]);

  // ✅ 모달이 보이지 않거나 주문이 없으면 렌더링하지 않음
  if (!isVisible || !order) return null;

  // ✅ 금액 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  // ✅ 확인 모달 표시
  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  // ✅ 확인 모달 닫기
  const hideConfirm = () => {
    setShowConfirmModal(false);
    setConfirmMessage('');
    setConfirmAction(null);
  };

  // ✅ 확인 버튼 클릭
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    hideConfirm();
  };

  // ✅ 수량 감소 - 확인 모달 추가
  const handleDecrease = async (orderDetailNo, productNo, currentQuantity) => {
    if (loading) return;
    
    showConfirm(`수량을 ${currentQuantity}개에서 ${currentQuantity - 1}개로 변경하시겠습니까?`, async () => {
      setLoading(true);
      try {
        if (onQuantityChange) {
          await onQuantityChange(order.no, orderDetailNo, productNo, 'decrease');
        }
      } catch (error) {
        console.error('❌ 수량 감소 실패:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  // ✅ 수량 증가 - 확인 모달 추가
  const handleIncrease = async (orderDetailNo, productNo, currentQuantity) => {
    if (loading) return;
    
    showConfirm(`수량을 ${currentQuantity}개에서 ${currentQuantity + 1}개로 변경하시겠습니까?`, async () => {
      setLoading(true);
      try {
        if (onQuantityChange) {
          await onQuantityChange(order.no, orderDetailNo, productNo, 'increase');
        }
      } catch (error) {
        console.error('❌ 수량 증가 실패:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  // ✅ 개별 상품 삭제 - 확인 모달 추가
  const handleDeleteItem = async (orderDetailNo, productNo, productName) => {
    if (loading) return;
    
    showConfirm(`"${productName}"를 주문에서 삭제하시겠습니까?`, async () => {
      setLoading(true);
      try {
        if (onDeleteItem) {
          await onDeleteItem(order.no, orderDetailNo, productNo);
        }
      } catch (error) {
        console.error('❌ 상품 삭제 실패:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  // ✅ 전체 주문 취소 - 확인 모달 추가
  const handleDeleteOrder = async () => {
    if (loading) return;
    
    showConfirm(`주문번호 ${order.no}번을 전체 취소하시겠습니까?\n취소된 주문은 복구할 수 없습니다.`, async () => {
      setLoading(true);
      try {
        if (onDeleteOrder) {
          await onDeleteOrder(order.no);
          onClose(); // 모달 닫기
        }
      } catch (error) {
        console.error('❌ 주문 취소 실패:', error);
      } finally {
        setLoading(false);
      }
    });
  };
  

  return (
    <>
      {/* ✅ 확인 모달 */}
      {showConfirmModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-box">
            <div className="modal-message" style={{ whiteSpace: 'pre-line' }}>
              {confirmMessage}
            </div>
            <div className="modal-buttons">
              <button 
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginRight: '10px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '처리중...' : '확인'}
              </button>
              <button 
                onClick={hideConfirm}
                disabled={loading}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 모달 오버레이 */}
      <div className="cancel-modal" onClick={onClose}>
        <div className="cancel-modal-box" onClick={(e) => e.stopPropagation()}>
          
          {/* ✅ 모달 상단 */}
          <div className="cancel-modal-header">
            <span className="cancel-modal-title">상품취소</span>
            <button 
              className="cancel-modal-close" 
              onClick={onClose}
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {/* ✅ 상품 취소 목록 */}
          <div className="cart-section-box">
            <div className="cart-section">
              <div className="cancel-cart-items">
                
                {orderDetails.length === 0 ? (
                  <div className="no-items">주문 상품이 없습니다.</div>
                ) : (
                  orderDetails.map((orderDetail, index) => (
                    <div key={`${orderDetail.o_no}-${orderDetail.p_no}-${index}`} className="cart-item">
                      
                      {/* ✅ 상품 좌측 (이름 + 수량 조절) */}
                      <div className="cart-item-left">
                        <div style={{ color: 'white' }}>
                          {orderDetail.p_name || '이름없음'}
                        </div>
                        
                        <div className="quantity-control">
                          {/* 수량 감소 - 확인 모달 추가 */}
                          <button 
                            className="cartcontrolBtn"
                            onClick={() => handleDecrease(
                              orderDetail.o_no, 
                              orderDetail.p_no, 
                              orderDetail.quantity
                            )}
                            disabled={loading || orderDetail.quantity <= 1}
                            title={orderDetail.quantity <= 1 ? '최소 수량입니다' : '수량 감소'}
                          >
                            <img src="/images/마이너스 하얀색.png" alt="감소" />
                          </button>
                          
                          {/* 현재 수량 */}
                          <span style={{ 
                            color: 'white',
                            textAlign: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}>
                            {orderDetail.quantity || 0}
                          </span>
                          
                          {/* 수량 증가 - 확인 모달 추가 */}
                          <button 
                            className="cartcontrolBtn"
                            onClick={() => handleIncrease(
                              orderDetail.o_no, 
                              orderDetail.p_no, 
                              orderDetail.quantity
                            )}
                            disabled={loading}
                            title="수량 증가"
                          >
                            <img src="/images/플러스 노란색.png" alt="증가" />
                          </button>
                        </div>
                      </div>

                      {/* ✅ 상품 우측 (가격 + 삭제) */}
                      <div className="cart-item-right">
                        <div>
                          {orderDetail.p_price && orderDetail.quantity 
                            ? formatPrice(orderDetail.p_price * orderDetail.quantity)
                            : '0원'
                          }
                        </div>
                        
                        <button 
                          className="deleteBtn"
                          onClick={() => handleDeleteItem(
                            orderDetail.o_no, 
                            orderDetail.p_no, 
                            orderDetail.p_name
                          )}
                          disabled={loading}
                          title={`${orderDetail.p_name} 삭제`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ✅ 실시간 계산된 총 주문금액 */}
              <div className="total-price">
                총 주문금액 
                <span style={{ fontWeight: 'bold' }}>
                  {formatPrice(currentTotalPrice)}
                </span>
                {/* ✅ 원래 금액과 다르면 표시 (디버깅용) */}
                {order.totalPrice !== currentTotalPrice && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#888', 
                    marginLeft: '8px',
                    textDecoration: 'line-through'
                  }}>
                    (원래: {formatPrice(order.totalPrice)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ✅ 하단 버튼 */}
          <div className="cancel-modal-footer">
            <button 
              className="allCancel"
              onClick={handleDeleteOrder}
              disabled={loading}
            >
              {loading ? '처리중...' : '전체 주문 취소'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderUpdateModal;