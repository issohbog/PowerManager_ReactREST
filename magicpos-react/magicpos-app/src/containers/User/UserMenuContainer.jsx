import React, { useEffect, useState } from "react";
import UserMenu from "../../components/User/usermenu";
import OrderCompleteModal from "../../components/User/modal/orderCompleteModal";
import { 
  getMenu, 
  getMenuByCategory,
  addToCart, 
  increaseCartItem, 
  decreaseCartItem, 
  deleteCartItem, 
  createOrder,
  getPaymentInfo,
  confirmPayment
} from "../../apis/menu";
import "../../components/css/menu.css";
import OrderModal from "../../components/User/modal/ordermodal";

// 메뉴 관련 데이터를 불러와서 MenuPage에 전달하는 컨테이너 컴포넌트
function UserMenuContainer() {
  const [menuData, setMenuData] = useState({
    categories: [],
    products: [],
    cartList: [],
    totalPrice: 0,
    usageInfo: {},
    orderList: [],
    orderDetailsMap: {},
    ongoingOrderList: [],    
    historyOrderList: [],    
  });
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrderCompleteModalOpen, setIsOrderCompleteModalOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  // 메뉴 데이터 fetch
  useEffect(() => {
    loadMenuData();
  }, []);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const isSuccess = params.get("payment") === "success";

  if (isSuccess) {
    setIsOrderCompleteModalOpen(true);  // ✅ 주문 완료 모달 열기

    // ✅ URL 정리 (뒤로가기 시 또 안뜨게)
    window.history.replaceState({}, '', '/menu');
  }
}, []);
  
  // 메뉴 데이터 로드 함수
  const loadMenuData = async (keyword) => {
    try {
      const response = await getMenu(keyword); // ✅ 검색 키워드 파라미터 추가
      const data = response.data;
      setMenuData({
        categories: data.categories || [],
        products: data.products || [],
        cartList: data.cartList || [],
        totalPrice: data.totalPrice || 0,
        usageInfo: data.usageInfo || {},
        orderList: data.orderList || [],
        orderDetailsMap: data.orderDetailsMap || {},
        ongoingOrderList: data.ongoingOrderList || [],
        historyOrderList: data.historyOrderList || []
      });
      setSelectedCategory(data.selectedCategory || 1);
    } catch (error) {
      console.error('메뉴 데이터 로드 실패:', error);
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryClick = (categoryNo) => {
    setSelectedCategory(categoryNo);
    loadMenuDataByCategory(categoryNo);
  };

  const loadMenuDataByCategory = async (categoryNo) => {
    try {
      const response = await getMenuByCategory(categoryNo);
      setMenuData(response.data);
    } catch (error) {
      console.error('카테고리별 메뉴 데이터 로드 실패:', error);
    }
  };

  // 상품 담기 핸들러
  const handleAddToCart = async (product) => {
    try {
      console.log('장바구니에 추가할 상품:', product);
      await addToCart(product.no);
      
      const response = await getMenu();
      setMenuData(prevState => ({
        ...prevState,
        cartList: response.data.cartList || [],
        totalPrice: response.data.totalPrice || 0
      }));
      setFlippedCards({});
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      console.error('에러 응답:', error.response?.data);
      alert('장바구니 추가에 실패했습니다.');
    }
  };

  // 장바구니 수량 증가 핸들러
  const handleCartIncrease = async (productNo) => {
    try {
      await increaseCartItem(productNo);
      
      const response = await getMenu();
      setMenuData(prevState => ({
        ...prevState,
        cartList: response.data.cartList || [],
        totalPrice: response.data.totalPrice || 0
      }));
    } catch (error) {
      console.error('수량 증가 실패:', error);
      alert('수량 증가에 실패했습니다.');
    }
  };

  // 장바구니 수량 감소 핸들러
  const handleCartDecrease = async (productNo) => {
    try {
      await decreaseCartItem(productNo);
      
      const response = await getMenu();
      setMenuData(prevState => ({
        ...prevState,
        cartList: response.data.cartList || [],
        totalPrice: response.data.totalPrice || 0
      }));
    } catch (error) {
      console.error('수량 감소 실패:', error);
      alert('수량 감소에 실패했습니다.');
    }
  };

  // 장바구니 항목 삭제 핸들러
  const handleCartDelete = async (cartNo) => {
    try {
      await deleteCartItem(cartNo);
      
      const response = await getMenu();
      setMenuData(prevState => ({
        ...prevState,
        cartList: response.data.cartList || [],
        totalPrice: response.data.totalPrice || 0
      }));
    } catch (error) {
      console.error('장바구니 삭제 실패:', error);
      alert('장바구니 삭제에 실패했습니다.');
    }
  };

  // ✅ 수정된 주문하기 버튼 핸들러 (finalOrderData로 변경)
  const handleOrder = async (finalOrderData) => {
    try {
      console.log('📝 주문 데이터:', finalOrderData);
      
      const response = await createOrder(finalOrderData);
      const orderNo = response.data.orderNo;
      
    if (finalOrderData.payment === '카드' || finalOrderData.payment === '카카오페이') {
      // ✅ 백엔드에 결제 정보 요청
      const paymentInfoRes = await getPaymentInfo({
        orderNo: orderNo,
        seatId: finalOrderData.seatId,
        totalPrice: finalOrderData.totalPrice,
        customerName: menuData.usageInfo?.username || '비회원',
        payment: finalOrderData.payment,
        cartList: finalOrderData.cartList
      });

      // Toss 창 열기
      await handleTossPaymentWindow(paymentInfoRes.data, finalOrderData);

    } else {
      console.log('✅ 현금 주문 성공!');
      await loadMenuData();
      handleOrderComplete();
    }
      
    } catch (error) {
      console.error('❌ 주문 실패:', error);
      alert(`주문에 실패했습니다.\n사유: ${error.response?.data?.message || error.message}`);
    }
  }; // ✅ 함수 제대로 닫기

  // ✅ 토스페이먼츠 결제창 호출 함수 (finalOrderData로 변경)
  const handleTossPaymentWindow = async (paymentInfo, finalOrderData) => {
    try {
      console.log('💳 토스페이먼츠 결제 시작:', paymentInfo);
      
      const { loadTossPayments } = await import('@tosspayments/payment-sdk');
      const tossPayments = await loadTossPayments('test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq');

      // 결제 방법 결정
      const paymentMethod = finalOrderData.payment === '카드' ? '카드' : '간편결제';
      
      await tossPayments.requestPayment(paymentMethod, {
        amount: paymentInfo.amount,
        orderId: paymentInfo.orderId,
        orderName: paymentInfo.orderName,
        customerName: paymentInfo.customerName,
        successUrl: paymentInfo.successUrl,
        failUrl: paymentInfo.failUrl,
      });

    } catch (error) {
      console.error('토스페이먼츠 결제 실패:', error);
      alert('결제에 실패했습니다.');
    }
  };

  // ✅ 검색 핸들러 (별도 함수로 분리)
  const handleSearch = (keyword) => {
    if (keyword) {
      loadMenuData(keyword);  // 검색어가 있으면 전체 검색
    } else {
      loadMenuDataByCategory(selectedCategory);  // 검색어가 없으면 현재 카테고리로 복원
    }
  };

  // 주문내역 모달 열기
  const handleOpenOrderModal = async () => {
    try {
      await loadMenuData();
      setIsOrderModalOpen(true);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setIsOrderModalOpen(true);
    }
  };

  // 주문 완료 모달 열기
  const handleOrderComplete = () => {
    setIsOrderCompleteModalOpen(true);
  };

  // 주문 완료 모달 닫기
  const closeOrderCompleteModal = () => {
    setIsOrderCompleteModalOpen(false);
  };

  return (
    <>
      <UserMenu
        categories={menuData.categories}
        selectedCategory={selectedCategory}
        products={menuData.products}
        cartList={menuData.cartList}
        totalPrice={menuData.totalPrice}
        usageInfo={menuData.usageInfo}
        ticketList={menuData.ticketList}
        usedTime={menuData.usedTime}
        remainTime={menuData.remainTime}
        onCategoryClick={handleCategoryClick}
        onAddToCart={handleAddToCart}
        onOrder={handleOrder}
        onSearch={handleSearch}
        onCartIncrease={handleCartIncrease}
        onCartDecrease={handleCartDecrease}
        onCartDelete={handleCartDelete}
        onOpenOrderModal={handleOpenOrderModal}
        setFlippedCards={setFlippedCards}
        flippedCards={flippedCards}
      />
      
      <OrderModal
        isOpen={isOrderModalOpen}
        ongoingOrders={menuData.ongoingOrderList}
        historyOrders={menuData.historyOrderList}
        orderDetailsMap={menuData.orderDetailsMap}
        onClose={() => setIsOrderModalOpen(false)}
      />

      <OrderCompleteModal 
        isOpen={isOrderCompleteModalOpen}
        onClose={closeOrderCompleteModal}
      />
    </>
  );
}

export default UserMenuContainer;
