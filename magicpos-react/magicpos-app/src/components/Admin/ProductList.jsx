import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styles from '../css/ProductList.module.css';
import Pagination from './Pagination';

const ProductList = forwardRef((props, ref) => {
  const { products, pagination, categoryMap, onSearch, onEdit, onRegister, onDelete, onPageChange, onView, onCategoryClick, onCategoryChange, onCheckboxChange, selectedProductNos, clearSelectedProductNos } = props;
  const [type, setType] = useState('');
  const [keyword, setKeyword] = useState('');

  // 외부에서 선택해제 할 수 있도록 함수 노출
  useImperativeHandle(ref, () => ({
    clearSelection: () => clearSelectedProductNos()
  }));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(type, keyword);
  };

  const handleCheckboxChange = (productNo, checked) => {
    onCheckboxChange(productNo, checked); // 컨테이너의 상태 업데이트
  };


  // 상품삭제 버튼 클릭
  const handleDeleteClick = () => {
    if (selectedProductNos.length === 0) {
      alert('삭제할 상품을 선택하세요.');
      return;
    }
    if (!window.confirm('정말로 삭제하시겠습니까?')) {
      return;
    }
    // 여러 개 삭제도 지원하려면 배열 전체 전달
    onDelete(selectedProductNos);
    clearSelectedProductNos(); // 삭제 후 선택 해제
  };

  // 카테고리 변경
  const handleCategorySelect = (event) => {
    const selectedCategory = event.target.value;
    setType(selectedCategory); // 로컬 상태 업데이트
    console.log('Selected Category:', selectedCategory);
    onCategoryChange(selectedCategory);   // 부모컴포넌트에 전달
  };


  return (
    <div className={styles.productList}>
      <div className={styles.topControls}>
        <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
          <select value={type} onChange={handleCategorySelect} className={styles.adminCategory}>
            <option value="">전체</option>
            {Object.entries(categoryMap).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          <div className={styles.searchBox}>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="상품명/상품설명/상품가격"
            />
            <button type="submit" className={styles.searchIcon}>
              <img src="/images/search.png" alt="검색" />
            </button>
          </div>
        </form>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.btnCategory} onClick={onCategoryClick}>상품분류등록</button>
        <button className={styles.btnRegister} onClick={onRegister}>상품등록</button>
        <button className={styles.btnEdit} onClick={onEdit}>상품수정</button>
        <button className={styles.btnDelete} onClick={handleDeleteClick}>상품삭제</button>
      </div>

      <table>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>No.</th>
            <th>상품분류</th>
            <th>상품명</th>
            <th>상품설명</th>
            <th>상품가격</th>
            <th>손님PC</th>
            <th>재고</th>
            <th>금일 판매량</th>
          </tr>
        </thead>
        <tbody>
          {(products || []).map((product, idx) => (
            <tr key={product.no}
                onClick={() => onView && onView(product)}
                style={{ cursor: 'pointer' }}
              >
              <td><input 
                    type="checkbox"
                    checked={selectedProductNos.includes(product.no)}
                    onChange={e => handleCheckboxChange(product.no, e.target.checked)}
                    onClick={e => e.stopPropagation()}
                  />
              </td>
              <td>{(pagination.page - 1) * pagination.size + idx + 1}</td>
              <td>{categoryMap[product.cno] || '알 수 없음'}</td> {/* 조건부 렌더링 추가 */}
              <td>{product.pname}</td>
              <td>{product.description}</td>
              <td>{product.pprice.toLocaleString()}원</td>
              <td>{product.sellStatus ? 'O' : 'X'}</td>
              <td>{product.stock}</td>
              <td>{product.todaySales}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
});

export default ProductList;