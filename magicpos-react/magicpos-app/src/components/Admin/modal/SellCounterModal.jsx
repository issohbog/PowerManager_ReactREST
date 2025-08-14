import React from 'react';
import '../../css/sellcounter.css';

const SellCounterModal = ({
  isVisible,
  onClose,
  categories,
  selectedCategory,
  setSelectedCategory,
  keyword,
  setKeyword,
  products,
  loadProducts,
  cart,
  seatId,
  setSeatId,
  payment,
  setPayment,
  totalPrice,
  addToCart,
  updateCart,
  handleOrder,
}) => {
  if (!isVisible) return null;

  return (
    <div className="adminsellcounter" style={{ display: 'flex' }}>
      <div className="sell-modal-box">
        <div className="sell-modal-header">
          <span className="sell-modal-title">상품판매</span>
          <button className="sell-modal-close" onClick={onClose}>X</button>
        </div>
        <div className="sell-modal-footer">
          <div className="productlist">
            <div className="top-controls">
              <form className="search-box" onSubmit={e => { e.preventDefault(); loadProducts(keyword, selectedCategory); }}>
                <select
                  name="category"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="admin_product_category"
                >
                  <option value="">카테고리 전체</option>
                  {categories.map(c => (
                    <option key={c.no} value={c.no}>{c.cname}</option>
                  ))}
                </select>
                <div className="search-box">
                  <input
                    type="text"
                    name="keyword"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="상품명/상품설명/상품가격"
                  />
                  <button type="submit" className="search-icon">
                    <img src="/images/search.png" alt="검색버튼" />
                  </button>
                </div>
              </form>
            </div>
            <div className="sell-table-wrapper">
              <table className="sell-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>상품분류</th>
                    <th>상품명</th>
                    <th>재고</th>
                    <th>상품가격</th>
                    <th><img src="/images/하얀 플러스.png" alt="추가" /></th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="6">😢 상품이 없습니다</td></tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.no}>
                        <td>{product.no}</td>
                        <td>{product.categoryName}</td>
                        <td>{product.pName}</td>
                        <td>{product.stock}개</td>
                        <td>{product.pPrice.toLocaleString()}원</td>
                        <td>
                          <button className="cart-add-btn" onClick={() => addToCart(product.no)}>
                            <img src="/images/회색 플러스.png" alt="담기" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="sellcounter-side-panel">
            <div className="sell-seat-input">
              <span>좌석번호</span>
              <input
                type="text"
                value={seatId}
                onChange={e => setSeatId(e.target.value)}
                placeholder="좌석번호를 입력하세요"
                style={{ width: '220px', border: '1px solid #D5D8DC', boxSizing: 'border-box' }}
              />
            </div>
            <div className="cart-section">
              <div className="sellcounter-cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart-message" style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                    🛒 장바구니가 비어 있습니다.
                  </div>
                ) : (
                  cart.map(item => (
                    <div className="sell-cart-item" key={item.no}>
                      <input type="hidden" name="pNo" value={item.p_no} />
                      <input type="hidden" name="pName" value={item.p_name} />
                      <input type="hidden" name="quantity" value={item.quantity} />
                      <input type="hidden" name="stock" value={item.stock} />
                      <div className="cart-item-left">
                        <div>{item.p_name}</div>
                        <div className="quantity-control">
                          <button className="sellcontrolBtn" onClick={() => updateCart('decrease', item.p_no)}>
                            <img src="/images/마이너스 하얀색.png" alt="감소" />
                          </button>
                          <span>{item.quantity}</span>
                          <button className="sellcontrolBtn" onClick={() => updateCart('increase', item.p_no)}>
                            <img src="/images/플러스 노란색.png" alt="증가" />
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-right">
                        <div>{(item.p_price * item.quantity).toLocaleString()}원</div>
                        <button className="selldeleteBtn" onClick={() => updateCart('delete', null, item.no)}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="total-price">
                총 주문금액 <span>{totalPrice.toLocaleString()}원</span>
              </div>
            </div>
            <form id="orderForm" onSubmit={e => e.preventDefault()}>
              <input type="hidden" name="seatId" value={seatId} />
              <div className="payment-order">
                <div className="sellcounter-payment-methods">
                  <label>
                    <input type="radio" name="payment" value="현금"
                      checked={payment === '현금'}
                      onChange={e => setPayment(e.target.value)}
                      required
                    />현금
                  </label>
                  <label>
                    <input type="radio" name="payment" value="카드"
                      checked={payment === '카드'}
                      onChange={e => setPayment(e.target.value)}
                    />카드
                  </label>
                </div>
                <button className="sell-order-button" type="button" onClick={handleOrder}>판매하기</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellCounterModal;