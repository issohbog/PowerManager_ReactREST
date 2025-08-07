import axios from 'axios';

// 메뉴 전체 조회 (검색 포함)
export const getMenu = (keyword = '') => {
  const url = '/api/menu';
  const params = {};
  
  if (keyword && keyword.trim()) {
    params.keyword = keyword;
  }
  
  return axios.get(url, { params });
};

// 카테고리별 상품 조회
export const getMenuByCategory = (categoryNo) => {
  return axios.get(`/api/menu?selectedCategory=${categoryNo}`);
};

// ✅ 장바구니 추가 - 경로와 데이터 형식 수정
export const addToCart = (productNo) => {
  return axios.post('/api/carts/add', {
    pNo: productNo,  // ← p_no 필드명 맞춤
    quantity: 1      // ← 기본 수량 1
  });
};

// 장바구니 수량 증가 - 직접 Long 값 전송
export const increaseCartItem = (productNo) => {
  return axios.post('/api/carts/increase', productNo, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 장바구니 수량 감소 - 직접 Long 값 전송
export const decreaseCartItem = (productNo) => {
  return axios.post('/api/carts/decrease', productNo, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 장바구니 항목 삭제 - 직접 Long 값 전송
export const deleteCartItem = (cartNo) => {
  return axios.post('/api/carts/delete', cartNo, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 주문 생성
export const createOrder = (orderData) => {
  return axios.post('/api/users/orders/create', orderData);
};
