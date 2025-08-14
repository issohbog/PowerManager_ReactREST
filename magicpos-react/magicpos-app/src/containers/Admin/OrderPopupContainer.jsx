import React, { useState, useEffect } from 'react';
import { 
  getOrderList, 
  updateOrderStatus, 
  cancelOrder,
  getOrderDetails,
  updateOrderQuantity,
  deleteOrderItem,
  deleteOrder
} from '../../apis/orderpopup';
import OrderPopup from '../../components/Admin/orderpopup';
import OrderUpdateModal from '../../components/Admin/modal/OrderUpdatemodal';

const OrderPopupContainer = ({ isVisible, onClose }) => {
  
  // ✅ 주문 팝업 상태
  const [orderList, setOrderList] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [preparingCount, setPreparingCount] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('all');
  const [menuNamesMap, setMenuNamesMap] = useState({});
  const [orderDetailsMap, setOrderDetailsMap] = useState({});

  // ✅ 업데이트 모달 상태
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);

  // ✅ 주문 데이터 로드
  const loadOrderData = async (status = 'all') => {
    try {
      console.log('📥 주문 데이터 로딩 시작:', status);
      
      const response = await getOrderList(status);
      
      if (response.data.success) {
        setOrderList(response.data.orderList || []);
        setOrderCount(response.data.orderCount || 0);
        setPreparingCount(response.data.preparingCount || 0);
        setMenuNamesMap(response.data.menuNamesMap || {});
        setOrderDetailsMap(response.data.orderDetailsMap || {}); // ✅ 추가
        setCurrentStatus(status);
        
        console.log('✅ 주문 데이터 로드 성공:', response.data);
      } else {
        console.error('❌ API 응답 실패:', response.data.message);
      }
      
    } catch (error) {
      console.error('❌ 주문 데이터 로드 실패:', error);
    }
  };

  // ✅ 주문 상태 업데이트
  const handleStatusUpdate = async (orderNo, newStatus) => {
    try {
      console.log(`🔄 주문 상태 업데이트: ${orderNo} → ${newStatus}`);
      
      const response = await updateOrderStatus(orderNo, newStatus);
      
      if (response.data.success) {
        await loadOrderData(currentStatus);
        console.log('✅ 주문 상태 업데이트 성공');
      }
    } catch (error) {
      console.error('❌ 주문 상태 업데이트 실패:', error);
    }
  };

  // ✅ 탭 변경
  const handleTabChange = async (status) => {
    console.log('🎯 탭 변경 요청:', status);
    await loadOrderData(status);
  };

  // ✅ 판매취소/업데이트 모달 처리
  const handleCancelOrderClick = async (order, action) => {
  if (action === 'update') {
      // 업데이트 모달 열기
      try {
        const details = await loadOrderDetails(order.no);
        setSelectedOrder(order);
        setOrderDetails(details);
        setShowUpdateModal(true);
      } catch (error) {
        console.error('❌ 주문 상세 로드 실패:', error);
      }
    }
  };

  // ✅ 주문 상세 로드
  const loadOrderDetails = async (orderNo) => {
    // 먼저 orderDetailsMap에서 찾기
    if (orderDetailsMap && orderDetailsMap[orderNo]) {
      return orderDetailsMap[orderNo];
    }
    
    // 별도 API 호출
    try {
      const response = await getOrderDetails(orderNo);
      return response.data.orderDetails || [];
    } catch (error) {
      console.error('❌ 주문 상세 API 호출 실패:', error);
      return [];
    }
  };

  // ✅ 수량 변경
  const handleQuantityChange = async (orderNo, orderDetailNo, productNo, action) => {
    try {
      console.log(`🔄 수량 ${action}:`, { orderNo, orderDetailNo, productNo });
      
      const response = await updateOrderQuantity(orderNo, orderDetailNo, productNo, action);
      
      if (response.data.success) {
        // 주문 상세 다시 로드
        const updatedDetails = await loadOrderDetails(orderNo);
        setOrderDetails(updatedDetails);
        setShowUpdateModal(false)
        // setShowUpdateModal(true); // 모달 다시 열기
        
        // 전체 주문 데이터도 다시 로드 (총 금액 변경 등)
        await loadOrderData(currentStatus);
      }
    } catch (error) {
      console.error('❌ 수량 변경 실패:', error);
    }
  };

  // ✅ 개별 상품 삭제
  const handleDeleteItem = async (orderNo, orderDetailNo, productNo) => {
    try {
      console.log('🗑️ 상품 삭제:', { orderNo, orderDetailNo, productNo });
      
      const response = await deleteOrderItem(orderNo, orderDetailNo, productNo);
      
      if (response.data.success) {
        setShowUpdateModal(false)
        // 주문 상세 다시 로드
        const updatedDetails = await loadOrderDetails(orderNo);
        setOrderDetails(updatedDetails);
        
        // 상품이 모두 삭제되면 모달 닫기
        if (updatedDetails.length === 0) {
          setShowUpdateModal(false);
        }
        
        // 전체 주문 데이터도 다시 로드
        await loadOrderData(currentStatus);
      }
    } catch (error) {
      console.error('❌ 상품 삭제 실패:', error);
    }
  };

  // ✅ 전체 주문 삭제
  const handleDeleteOrder = async (orderNo) => {
    try {
      console.log('🗑️ 전체 주문 삭제:', orderNo);
      
      const response = await deleteOrder(orderNo);
      
      if (response.data.success) {
        setShowUpdateModal(false); // 모달 닫기
        await loadOrderData(currentStatus); // 데이터 다시 로드
        console.log('✅ 전체 주문 삭제 성공');
      }
    } catch (error) {
      console.error('❌ 주문 삭제 실패:', error);
    }
  };

  // ✅ 팝업이 열리면 데이터 로드
  useEffect(() => {
    if (isVisible) {
      loadOrderData('all');
    }
  }, [isVisible]);

  return (
    <>
      {/* ✅ 주문 팝업 */}
      <OrderPopup
        isVisible={isVisible}
        onClose={onClose}
        orderList={orderList}
        orderCount={orderCount}
        preparingCount={preparingCount}
        menuNamesMap={menuNamesMap}
        onStatusUpdate={handleStatusUpdate}
        onTabChange={handleTabChange}
        onCancelOrderClick={handleCancelOrderClick}  // ✅ 통합 핸들러
      />

      {/* ✅ 업데이트 모달 */}
      <OrderUpdateModal
        isVisible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        order={selectedOrder}
        orderDetails={orderDetails}
        onQuantityChange={handleQuantityChange}
        onDeleteItem={handleDeleteItem}
        onDeleteOrder={handleDeleteOrder}
      />
    </>
  );
};

export default OrderPopupContainer;