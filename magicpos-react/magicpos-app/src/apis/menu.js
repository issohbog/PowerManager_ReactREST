import api from "./axios";
import Swal from 'sweetalert2';

// 메뉴 전체 조회 (검색 포함)
export const getMenu = (keyword = '') => {
  const url = '/menu';
  const params = {};
  
  if (keyword && keyword.trim()) {
    params.keyword = keyword;
  }
  
  return api.get(url, { params });
};

// 카테고리별 상품 조회
export const getMenuByCategory = (categoryNo) => {
  return api.get(`/menu?selectedCategory=${categoryNo}`);
};

// ✅ 장바구니 추가 - 경로와 데이터 형식 수정
export const addToCart = (productNo) => {
  return api.post('/carts/add', {
    pNo: productNo,  // ← p_no 필드명 맞춤
    quantity: 1      // ← 기본 수량 1
  });
};

// 장바구니 수량 증가 - 직접 Long 값 전송
export const increaseCartItem = async (productNo) => {
  const res = await api.post('/carts/increase', productNo, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (res.data && res.data.success === false) {
    Swal.fire({
      icon: 'warning',
      title: '알림',
      text: res.data.message,
    });
  }
  return res;
};

// 장바구니 수량 감소 - 직접 Long 값 전송
export const decreaseCartItem = (productNo) => {
  return api.post('/carts/decrease', productNo, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 장바구니 항목 삭제 - 직접 Long 값 전송
export const deleteCartItem = (cartNo) => {
  return api.post('/carts/delete', cartNo, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 주문 생성
export const createOrder = (orderData) => {
  return api.post('/users/orders/create', orderData);
};

// ✅ 토스페이먼츠 관련 API 추가
export const getPaymentInfo = (orderData) => {
  return api.post('/users/orders/payment-info', orderData);
};

export const confirmPayment = (paymentData) => {
  return api.post('/users/orders/success', paymentData);
};
