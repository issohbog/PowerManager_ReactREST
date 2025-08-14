import React, { useEffect, useState } from 'react';
import SellCounterModal from '../../components/Admin/modal/SellCounterModal';
import {
  getAdminCategories,
  getAdminProducts,
  getAdminCart,
  addAdminCartItem,
  updateAdminCartItem,
  createAdminOrder,
  saveAdminTempOrder,
  getAdminPaymentInfo,
  confirmAdminPayment
} from '../../apis/sellcounter';

const SellCounterModalContainer = ({ isVisible, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [seatId, setSeatId] = useState('');
  const [payment, setPayment] = useState('현금');
  const [totalPrice, setTotalPrice] = useState(0);

  // 카테고리 불러오기
  useEffect(() => {
    if (!isVisible) return;
    getAdminCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.error('❌ 카테고리 불러오기 실패:', err));
  }, [isVisible]);

  // 상품 불러오기
  const loadProducts = (searchKeyword = '', category = '') => {
    getAdminProducts(searchKeyword, category)
      .then(res => setProducts(res.data))
      .catch(err => console.error('❌ 상품 불러오기 실패:', err));
  };

  useEffect(() => {
    if (isVisible) loadProducts(keyword, selectedCategory);
  }, [isVisible, keyword, selectedCategory]);

  // 장바구니 불러오기
  const loadCart = () => {
    getAdminCart()
      .then(res => {
        const list = res.data;
        setCart(list);
        setTotalPrice(list.reduce((sum, item) => sum + item.p_price * item.quantity, 0));
      })
      .catch(err => console.error('❌ 장바구니 로딩 에러:', err));
  };

  useEffect(() => {
    if (isVisible) loadCart();
  }, [isVisible]);

  // 상품 장바구니 추가
  const addToCart = async (pNo) => {
    try {
      await addAdminCartItem(pNo);
      loadCart();
    } catch (err) {
      alert('❌ 장바구니 추가 실패');
    }
  };

  // 수량 증가/감소/삭제
  const updateCart = async (action, pNo, cNo) => {
    try {
      await updateAdminCartItem(action, pNo, cNo);
      loadCart();
    } catch (err) {
      alert('❌ 수량/삭제 실패');
    }
  };

  // 주문 처리
  const handleOrder = async () => {
    if (!seatId) return alert('좌석번호를 입력하세요.');
    if (!payment) return alert('결제 수단을 선택하세요.');
    if (cart.length === 0) return alert('장바구니가 비어있습니다!');

    const pNoList = cart.map(item => item.p_no);
    const quantityList = cart.map(item => item.quantity);
    const pNameList = cart.map(item => item.p_name);
    const stockList = cart.map(item => item.stock);

    if (payment === '현금') {
      try {
        await createAdminOrder({
          seatId,
          totalPrice,
          payment,
          pNoList,
          quantityList,
          pNameList,
          stockList
        });
        alert('✅ 주문이 완료되었습니다!');
        loadCart();
      } catch (err) {
        alert('❌ 주문 실패');
      }
      return;
    }

    // 카드 결제 TossPayments 연동 (React 방식)
    try {
      const userNo = 1; // 필요시 실제 로그인 정보로 변경

      // 1. 세션에 주문정보 저장
      await saveAdminTempOrder({
        seatId,
        pNoList,
        quantityList,
        pNameList,
        stockList,
        totalPrice,
        payment,
        userNo
      });

      // 2. 결제 정보 생성
      const payRes = await getAdminPaymentInfo({
        seatId,
        pNoList,
        quantityList,
        pNameList,
        stockList,
        totalPrice,
        payment,
        userNo
      });

      const paymentInfo = payRes.data;

      // 3. 결제창 호출 (TossPayments SDK)
      try {
        const { loadTossPayments } = await import('@tosspayments/payment-sdk');
        const tossPayments = await loadTossPayments('test_ck_ZLKGPx4M3MGPnBZkRAlwrBaWypv1');

        await tossPayments.requestPayment(payment, {
          amount: paymentInfo.amount,
          orderId: paymentInfo.orderId,
          orderName: paymentInfo.orderName,
          customerName: paymentInfo.customerName,
          successUrl: paymentInfo.successUrl,
          failUrl: paymentInfo.failUrl
        });
      } catch (error) {
        console.error('토스페이먼츠 결제 실패:', error);
        alert('결제에 실패했습니다.');
      }
    } catch (err) {
      console.error("❌ 관리자 결제 처리 중 오류:", err);
      alert("결제 도중 문제가 발생했습니다.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get('payment');
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');

    if (paymentResult === 'success' && paymentKey && orderId && amount) {
      // 결제 성공 시 주문 처리 API 호출
      confirmAdminPayment({ paymentKey, orderId, amount })
        .then(res => {
          if (res.data.success) {
            alert('✅ 결제 성공! 주문이 완료되었습니다.');
            loadCart();
          } else {
            alert('❌ 주문 처리 실패: ' + res.data.message);
          }
          window.history.replaceState({}, '', '/admin');
        })
        .catch(err => {
          alert('❌ 주문 처리 중 오류');
          window.history.replaceState({}, '', '/admin');
        });
    } else if (paymentResult === 'fail') {
      alert('❌ 결제 실패! 다시 시도해주세요.');
      window.history.replaceState({}, '', '/admin');
    }
  }, []);

  return (
    <SellCounterModal
      isVisible={isVisible}
      onClose={onClose}
      categories={categories}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      keyword={keyword}
      setKeyword={setKeyword}
      products={products}
      loadProducts={loadProducts}
      cart={cart}
      seatId={seatId}
      setSeatId={value => setSeatId(value.toUpperCase())}
      payment={payment}
      setPayment={setPayment}
      totalPrice={totalPrice}
      addToCart={addToCart}
      updateCart={updateCart}
      handleOrder={handleOrder}
    />
  );
};

export default SellCounterModalContainer;