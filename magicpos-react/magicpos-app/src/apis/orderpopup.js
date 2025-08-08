import axios from 'axios';

/**
 * 주문 리스트 조회
 * @param {string} status - 주문 상태 ('all', '1', '2')
 */
export const getOrderList = (status = 'all') => {
  console.log('📤 주문 리스트 API 호출:', status);
  
  return axios.get(`/admin/orders/orderpopup`, {
    params: { status }
  });
};

/**
 * 주문 상태 업데이트
 * @param {number} orderNo - 주문 번호
 * @param {number} newStatus - 새로운 상태 (1: 준비중, 2: 전달완료)
 */
export const updateOrderStatus = (orderNo, newStatus) => {
  console.log('📤 주문 상태 업데이트 API 호출:', { orderNo, newStatus });
  
  return axios.post(`/admin/orders/status`, null, {
    params: {
      no: orderNo,
      orderStatus: newStatus
    }
  });
};

/**
 * 주문 취소
 * @param {number} orderNo - 주문 번호
 */
export const cancelOrder = (orderNo) => {
  console.log('📤 주문 취소 API 호출:', orderNo);
  
  return axios.post(`/admin/orders/delete`, null, {
    params: {
      orderNo: orderNo
    }
  });
};

/**
 * 주문 상세 조회
 * @param {number} orderNo - 주문 번호
 */
export const getOrderDetails = (orderNo) => {
  console.log('📤 주문 상세 조회 API 호출:', orderNo);
  
  return axios.get(`/admin/orders/${orderNo}/details`);
};

/**
 * 주문 상품 수량 변경
 * @param {number} orderNo - 주문 번호
 * @param {number} orderDetailNo - 주문 상세 번호 (o_no)
 * @param {number} productNo - 상품 번호 (p_no)
 * @param {string} action - 'increase' 또는 'decrease'
 */
export const updateOrderQuantity = (orderNo, orderDetailNo, productNo, action) => {
  console.log('📤 수량 변경 API 호출:', { orderNo, orderDetailNo, productNo, action });
  
  const endpoint = action === 'increase' ? 'increaseQuantity' : 'decreaseQuantity';
  
  return axios.post(`/admin/orders/${endpoint}`, null, {
    params: {
      oNo: orderDetailNo,
      pNo: productNo,
      orderNo: orderNo
    }
  });
};

/**
 * 개별 상품 삭제
 * @param {number} orderNo - 주문 번호
 * @param {number} orderDetailNo - 주문 상세 번호 (o_no)
 * @param {number} productNo - 상품 번호 (p_no)
 */
export const deleteOrderItem = (orderNo, orderDetailNo, productNo) => {
  console.log('📤 상품 삭제 API 호출:', { orderNo, orderDetailNo, productNo });
  
  return axios.post('/admin/orders/delete/detail', null, {
    params: {
      oNo: orderDetailNo,
      pNo: productNo,
      orderNo: orderNo
    }
  });
};

/**
 * 전체 주문 삭제
 * @param {number} orderNo - 주문 번호
 */
export const deleteOrder = (orderNo) => {
  console.log('📤 전체 주문 삭제 API 호출:', orderNo);
  
  return axios.post('/admin/orders/delete', null, {
    params: {
      orderNo: orderNo
    }
  });
};
