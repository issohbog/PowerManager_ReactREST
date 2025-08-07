import React, { useEffect, useState } from "react";
import UserMenu from "../../components/User/usermenu";
import OrderCompleteModal from "../../components/User/modal/orderCompleteModal";  // ✅ 모달 import
import { 
  getMenu, 
  getMenuByCategory,
  addToCart, 
  increaseCartItem, 
  decreaseCartItem, 
  deleteCartItem, 
  createOrder 
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
    ongoingOrderList: [],    // ✅ 이미 있음
    historyOrderList: [],    // ✅ 이미 있음
  });
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrderCompleteModalOpen, setIsOrderCompleteModalOpen] = useState(false);  // ✅ 모달 상태 추가

  // 메뉴 데이터 fetch
  useEffect(() => {
    loadMenuData(); // ✅ 초기 로드
  }, []);

  // 메뉴 데이터 로드 함수
  const loadMenuData = async () => {
    try {
      const response = await getMenu();
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
      console.log('장바구니에 추가할 상품:', product); // 디버깅용
      await addToCart(product.no); // product.no가 올바른 값인지 확인
      
      // 장바구니 추가 후 최신 장바구니 정보 다시 가져오기
      const response = await getMenu();
      setMenuData(prevState => ({
        ...prevState,
        cartList: response.data.cartList || [],
        totalPrice: response.data.totalPrice || 0
      }));
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      console.error('에러 응답:', error.response?.data); // 상세 에러 확인
      alert('장바구니 추가에 실패했습니다.');
    }
  };

  // ✅ 장바구니 수량 증가 핸들러 - menu.js 함수 사용
  const handleCartIncrease = async (productNo) => {
    try {
      await increaseCartItem(productNo);  // ← API 함수 사용
      
      // 최신 장바구니 정보 다시 가져오기
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

  // ✅ 장바구니 수량 감소 핸들러 - menu.js 함수 사용
  const handleCartDecrease = async (productNo) => {
    try {
      await decreaseCartItem(productNo);  // ← API 함수 사용
      
      // 최신 장바구니 정보 다시 가져오기
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

  // ✅ 장바구니 항목 삭제 핸들러 - menu.js 함수 사용
  const handleCartDelete = async (cartNo) => {
    try {
      await deleteCartItem(cartNo);  // ← API 함수 사용
      
      // 최신 장바구니 정보 다시 가져오기
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

  // 주문하기 버튼 핸들러
  const handleOrder = async (orderData) => {
    try {
      await createOrder(orderData);
      
      // ✅ 주문 성공 후 최신 데이터 로드
      await loadMenuData();
      
    } catch (error) {
      console.error('주문 실패:', error);
      alert('주문에 실패했습니다.');
    }
  };

  // 검색 핸들러
  const handleSearch = (keyword) => {
    if (keyword) {
      loadMenuData(keyword);  // 검색어가 있으면 전체 검색
    } else {
      loadMenuDataByCategory(selectedCategory);  // 검색어가 없으면 현재 카테고리로 복원
    }
  };

  // 주문내역 모달 열기 (필요시 최신 데이터 로드)
  const handleOpenOrderModal = async () => {
    try {
      // ✅ 모달 열기 전에 최신 주문내역 로드
      await loadMenuData();
      setIsOrderModalOpen(true);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      // 에러가 나도 기존 데이터로 모달 열기
      setIsOrderModalOpen(true);
    }
  };

  // ✅ 주문 완료 모달 열기
  const handleOrderComplete = () => {
    setIsOrderCompleteModalOpen(true);
  };

  // ✅ 주문 완료 모달 닫기
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
        onOrderComplete={handleOrderComplete}  
      />
      
      <OrderModal
        isOpen={isOrderModalOpen}
        ongoingOrders={menuData.ongoingOrderList}     // ✅ 기존 데이터 사용
        historyOrders={menuData.historyOrderList}     // ✅ 기존 데이터 사용
        orderDetailsMap={menuData.orderDetailsMap}    // ✅ 기존 데이터 사용
        onClose={() => setIsOrderModalOpen(false)}
      />

      {/* ✅ 주문 완료 모달 */}
      <OrderCompleteModal 
        isOpen={isOrderCompleteModalOpen}
        onClose={closeOrderCompleteModal}
      />
    </>
  );
}

export default UserMenuContainer;
