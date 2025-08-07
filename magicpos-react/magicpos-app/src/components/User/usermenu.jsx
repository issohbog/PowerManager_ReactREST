import React, { useState, useEffect } from "react";
import { loadTossPayments } from '@tosspayments/payment-sdk';


// 프레젠테이셔널 컴포넌트: props로 데이터와 핸들러만 받아서 화면만 렌더링
function UserMenu({
  categories = [],
  selectedCategory = 1,
  products = [],
  cartList = [],
  totalPrice = 0,
  usageInfo = {},
  ticketList = [],
  usedTime = 0,
  remainTime = 0,
  onCategoryClick,
  onAddToCart,
  onOrder,
  onSearch,
  onCartIncrease,
  onCartDecrease,
  onCartDelete,
  onOpenOrderModal,
  onOrderComplete  
}) {
  const [flippedCards, setFlippedCards] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [orderData, setOrderData] = useState({
    payment: '',
    cash: '',
    cashManual: '',
    message: ''
  });
  
  // ✅ 토스페이먼츠 상태 추가
  const [tossPayments, setTossPayments] = useState(null);

  // ✅ 토스페이먼츠 초기화
  useEffect(() => {
    const initTossPayments = async () => {
      try {
        const payments = await loadTossPayments("test_ck_ZLKGPx4M3MGPnBZkRAlwrBaWypv1");
        setTossPayments(payments);
        console.log("✅ 토스페이먼츠 초기화 완료");
      } catch (error) {
        console.error("❌ 토스페이먼츠 초기화 실패:", error);
      }
    };

    initTossPayments();
  }, []);

  const toggleFlip = (productNo) => {
    setFlippedCards(prev => ({
      ...prev,
      [productNo]: !prev[productNo]
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchKeyword.trim()) {
      onSearch(searchKeyword.trim());
    }
  };

  const handleOrderDataChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ 주문 처리 함수 수정
  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    // 1. 기본 검증
    if (!orderData.payment) {
      alert('결제 방법을 선택해주세요.');
      return;
    }

    if (orderData.payment === '현금' && !orderData.cash) {
      alert('현금 결제 옵션을 선택해주세요.');
      return;
    }

    if (orderData.payment === '현금' && orderData.cash === 'manual') {
      if (!orderData.cashManual || orderData.cashManual.trim() === '') {
        alert('금액을 입력해주세요!');
        return;
      }
    }

    // 2. 현금 금액 계산
    let cashAmount = null;
    if (orderData.payment === '현금') {
      if (orderData.cash === 'manual') {
        cashAmount = parseInt(orderData.cashManual);
      } else if (orderData.cash === 'auto') {
        cashAmount = totalPrice;
      } else {
        cashAmount = parseInt(orderData.cash);
      }
    }

    // 3. 최종 주문 데이터 구성
    const finalOrderData = {
      seatId: usageInfo.seat_id,
      cartList,
      totalPrice,
      cashAmount: cashAmount,
      ...orderData
    };

    // 4. ✅ 결제 방법에 따른 처리
    if (orderData.payment === '현금') {
      // 현금 결제는 기존 방식
      try {
        if (onOrder) {
          await onOrder(finalOrderData);
          onOrderComplete && onOrderComplete();
        }
      } catch (error) {
        console.error('현금 주문 실패:', error);
      }
    } else {
      // 전자 결제는 토스페이먼츠
      await handleTossPayment(finalOrderData);
    }
  };

  // ✅ 토스페이먼츠 처리 함수
  const handleTossPayment = async (finalOrderData) => {
    if (!tossPayments) {
      alert("결제 시스템을 초기화하는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      console.log("🚀 토스페이먼츠 결제 시작...");

      // 1. 결제 정보 생성 요청
      const paymentInfo = await requestPaymentInfo(finalOrderData);
      
      // 2. 토스페이먼츠 결제 요청
      await tossPayments.requestPayment(finalOrderData.payment, {
        amount: paymentInfo.amount,
        orderId: paymentInfo.orderId,
        orderName: paymentInfo.orderName,
        customerName: paymentInfo.customerName,
        successUrl: paymentInfo.successUrl,
        failUrl: paymentInfo.failUrl
      });

    } catch (error) {
      console.error("❌ 토스페이먼츠 결제 중 오류:", error);
      alert("결제 도중 문제가 발생했습니다.");
    }
  };

  // ✅ 결제 정보 요청 함수
  const requestPaymentInfo = async (orderData) => {
    const response = await fetch('/api/users/orders/payment-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        seatId: orderData.seatId,
        pNoList: orderData.cartList.map(cart => cart.p_no),
        quantityList: orderData.cartList.map(cart => cart.quantity),
        pNameList: orderData.cartList.map(cart => cart.p_name),
        totalPrice: orderData.totalPrice,
        payment: orderData.payment,
        message: orderData.message
      })
    });

    if (!response.ok) {
      throw new Error("결제 정보 요청 실패");
    }

    return await response.json();
  };

  return (
    <div className="container">
      <div className="main-panel">
        {/* 상단 메뉴 */}
        <div className="top-menu">
          <button className="icon-button">
            <img src="/images/뒤로가기.png" alt="뒤로가기" />
          </button>
          <div className="menu-tabs">
            {categories.map(category => (
              <button
                key={category.no}
                className={category.no === selectedCategory ? "active" : ""}
                onClick={() => onCategoryClick && onCategoryClick(category.no)}
              >
                {category.cname}
              </button>
            ))}
          </div>
          <button className="icon-button">
            <img src="/images/다음페이지.png" alt="다음페이지" />
          </button>
          {/* ✅ 검색 폼 수정 */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              name="keyword" 
              placeholder="상품명 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit">
              <img src="/images/검색.png" alt="검색" />
            </button>
          </form>
        </div>

        {/* 상품 리스트 */}
        <div className="product-list">
          <div className="grid-container">
            {products.map(product => (
              <div 
                className={`product-card ${flippedCards[product.no] ? 'flipped' : ''}`} 
                key={product.no}
                onClick={() => toggleFlip(product.no)}
              >
                <div className="product-inner">
                  <div className="product-front">
                    <img src={product.imgPath} className="product-image" alt={product.pName} />
                    <div className="product-info">
                      <div>{product.pname}</div>
                      <div>{product.pprice?.toLocaleString()}원</div>
                    </div>
                  </div>
                  <div className="product-back">
                    <div className="back-frame">
                      <p>{product.description}</p>
                    </div>
                    {product.stock > 0 ? (
                      <button 
                        className="add-cart-btn" 
                        onClick={(e) => {
                          e.stopPropagation(); // 카드 뒤집기 방지
                          onAddToCart && onAddToCart(product);
                        }}
                      >
                        담기
                      </button>
                    ) : (
                      <button className="add-cart-btn sold-out" disabled>품절</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 사이드 패널 */}
      <div className="side-panel">
        <div className="seat-info">
          <div>좌석번호 <strong>{usageInfo.seat_id || "50"}</strong></div>
          <button id="openModalBtn" onClick={onOpenOrderModal}>주문내역보기</button>
        </div>
        {/* 장바구니 영역 */}
        <div className="cart-section">
          <div className="cart-items">
            {cartList.map((cart, idx) => (
              <div className="cart-item" key={cart.no || idx}>
                <div className="cart-item-left">
                  <div>{cart.p_name || "이름없음"}</div>
                  <div className="quantity-control">
                    <button 
                      type="button" 
                      className="cartcontrolBtn"
                      onClick={() => onCartDecrease && onCartDecrease(cart.p_no)}
                    >
                      <img src="/images/마이너스 하얀색.png" alt="감소" />
                    </button>
                    <span>{cart.quantity}</span>
                    <button 
                      type="button" 
                      className="cartcontrolBtn"
                      onClick={() => onCartIncrease && onCartIncrease(cart.p_no)}
                    >
                      <img src="/images/플러스 노란색.png" alt="증가" />
                    </button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <div>{(cart.p_price * cart.quantity)?.toLocaleString() || "0"}원</div>
                  <button 
                    className="deleteBtn"
                    onClick={() => onCartDelete && onCartDelete(cart.no)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="total-price">
            총 주문금액 <span style={{ fontWeight: "bold" }}>{totalPrice?.toLocaleString()}원</span>
          </div>
        </div>

        {/* ✅ 주문 폼 - 장바구니 바로 아래 */}
        <form id="orderForm" onSubmit={handleOrderSubmit}>
          {/* Hidden inputs */}
          <input type="hidden" name="seatId" value={usageInfo.seat_id} />
          {cartList.map((cart, idx) => (
            <div key={idx}>
              <input type="hidden" name="pNoList" value={cart.p_no} />
              <input type="hidden" name="quantityList" value={cart.quantity} />
              <input type="hidden" name="pNameList" value={cart.p_name} />
            </div>
          ))}
          <input type="hidden" name="totalPrice" value={totalPrice} />

          {/* 결제 방법 */}
          <div className="payment-methods">
            <label>
              <input 
                type="radio" 
                name="payment" 
                value="현금" 
                checked={orderData.payment === '현금'}
                onChange={(e) => handleOrderDataChange('payment', e.target.value)}
                required
              />
              현금
            </label>
            <label>
              <input 
                type="radio" 
                name="payment" 
                value="카드"
                checked={orderData.payment === '카드'}
                onChange={(e) => handleOrderDataChange('payment', e.target.value)}
              />
              카드
            </label>
            <label>
              <input 
                type="radio" 
                name="payment" 
                value="카카오페이"
                checked={orderData.payment === '카카오페이'}
                onChange={(e) => handleOrderDataChange('payment', e.target.value)}
              />
              💬<br />QR 결제
            </label>
          </div>

          {/* ✅ 현금 결제 옵션 - 조건 제거하여 항상 표시 */}
          <div className="cash-options">
            <div className="cash-quick">
              <label>
                <input 
                  type="radio" 
                  name="cash" 
                  value="50000" 
                  className="cash-option"
                  checked={orderData.cash === '50000'}
                  onChange={(e) => handleOrderDataChange('cash', e.target.value)}
                />
                5만원
              </label>
              <label>
                <input 
                  type="radio" 
                  name="cash" 
                  value="10000" 
                  className="cash-option"
                  checked={orderData.cash === '10000'}
                  onChange={(e) => handleOrderDataChange('cash', e.target.value)}
                />
                1만원
              </label>
              <label>
                <input 
                  type="radio" 
                  name="cash" 
                  value="5000" 
                  className="cash-option"
                  checked={orderData.cash === '5000'}
                  onChange={(e) => handleOrderDataChange('cash', e.target.value)}
                />
                5천원
              </label>
              <label>
                <input 
                  type="radio" 
                  name="cash" 
                  value="1000" 
                  className="cash-option"
                  checked={orderData.cash === '1000'}
                  onChange={(e) => handleOrderDataChange('cash', e.target.value)}
                />
                1천원
              </label>
            </div>
            <div className="cash-custom">
              <label>
                <input 
                  type="radio" 
                  name="cash" 
                  value="auto" 
                  className="cash-option"
                  checked={orderData.cash === 'auto'}
                  onChange={(e) => handleOrderDataChange('cash', e.target.value)}
                />
                금액에 맞게
              </label>
              <label className="cash-manual-label">
                <input 
                  type="radio" 
                  name="cash" 
                  value="manual" 
                  className="cash-option"
                  checked={orderData.cash === 'manual'}
                  onChange={(e) => handleOrderDataChange('cash', e.target.value)}
                />
                직접 입력
              <input 
                type="text" 
                name="cashManual"
                className="cash-manual-input"
                value={orderData.cashManual}
                onChange={(e) => handleOrderDataChange('cashManual', e.target.value)}
                placeholder="금액 입력"
              />
              </label>
            </div>
          </div>

          {/* 요청사항 */}
          <input 
            type="text" 
            className="request-input" 
            name="message" 
            maxLength="50" 
            placeholder="요청사항은 50자 까지 입력할 수 있습니다."
            value={orderData.message}
            onChange={(e) => handleOrderDataChange('message', e.target.value)}
          />

          <button className="order-button" type="submit">주문하기</button>
        </form>
      </div>
    </div>
  );
}

export default UserMenu;