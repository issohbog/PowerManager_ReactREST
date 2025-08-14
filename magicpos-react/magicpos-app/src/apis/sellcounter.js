import axios from 'axios';
import Swal from 'sweetalert2';

// 카테고리 불러오기
export function getAdminCategories() {
  return axios.get('/admin/categories/json');
}

// 상품 불러오기
export function getAdminProducts(keyword = '', category = '') {
  let url = '/admin/products/json';
  const params = [];
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (params.length > 0) url += '?' + params.join('&');
  return axios.get(url);
}

// 장바구니 불러오기
export function getAdminCart() {
  return axios.get('/admin/orders/cart/json');
}

// 공통 에러 알림 함수
export function showErrorAlert(message) {
  Swal.fire({
    icon: 'warning',
    title: '알림',
    text: message,
    customClass: {
      popup: 'swal-zindex'
    }
  });
}

// 상품 장바구니 추가
export async function addAdminCartItem(pNo) {
  const res = await axios.post('/admin/sellcounter/add', { pNo });
  if (res.data && res.data.success === false) {
    showErrorAlert(res.data.message);
  }
  return res;
}

// 장바구니 수량/삭제
export async function updateAdminCartItem(action, pNo, cNo) {
  let url = '';
  let data = {};
  if (action === 'increase') {
    url = '/admin/sellcounter/increase';
    data = { pNo };
  }
  if (action === 'decrease') {
    url = '/admin/sellcounter/decrease';
    data = { pNo };
  }
  if (action === 'delete') {
    url = '/admin/sellcounter/delete';
    data = { cNo };
  }
  const res = await axios.post(url, data);
  if (res.data && res.data.success === false) {
    showErrorAlert(res.data.message);
  }
  return res;
}

// 현금 주문 생성
export function createAdminOrder(orderData) {
  // orderData: { seatId, totalPrice, payment, pNoList, quantityList, pNameList, stockList }
  const params = new URLSearchParams();
  params.append('seatId', orderData.seatId);
  params.append('totalPrice', orderData.totalPrice);
  params.append('payment', orderData.payment);
  orderData.pNoList.forEach(v => params.append('pNoList', v));
  orderData.quantityList.forEach(v => params.append('quantityList', v));
  orderData.pNameList.forEach(v => params.append('pNameList', v));
  orderData.stockList.forEach(v => params.append('stockList', v));
  return axios.post('/admin/sellcounter/create', params);
}

// 임시 주문정보 저장
export function saveAdminTempOrder(tempOrder) {
  return axios.post('/admin/orders/temp', tempOrder);
}

// 결제 정보 생성
export function getAdminPaymentInfo(params) {
  return axios.post('/admin/sellcounter/payment-info', params);
}

// 관리자 상품 결제 성공 처리 API
export async function confirmAdminPayment(paymentData) {
  // paymentData: { paymentKey, orderId, amount }
  return await axios.post('/admin/payment/product/success', paymentData);
}
