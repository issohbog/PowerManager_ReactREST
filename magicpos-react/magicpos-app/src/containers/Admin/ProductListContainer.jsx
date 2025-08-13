import React, { useState, useEffect, useRef } from 'react';
import ProductList from '../../components/Admin/ProductList';
import ProductModal from '../../components/Admin/modal/ProductModal';
import { fetchProducts, saveProduct, deleteProduct, updateProduct, fetchCategories, createCategory, updateCategory, deleteCategory } from '../../apis/productList';
// import RegisterResultModal from '../../components/Admin/modal/RegisterResultModal';
// import EditResultModal from '../../components/Admin/modal/EditResultModal';
// import styles from '../../components/css/ProductModal.module.css';
import ProductCategoryModal from '../../components/Admin/modal/ProductCategoryModal';

const ProductListContainer = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [search, setSearch] = useState({ type: '', keyword: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('register'); // 'register' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categoryMap, setCategoryMap] = useState({}); // 카테고리 맵 상태 추가
  const [productCategoryModalOpen, setProductCategoryModalOpen] = useState(false);
 
  const [selectedProductNos, setSelectedProductNos] = useState([]); // 선택된 상품 번호 배열
  const productListRef = useRef();

  const clearSelection = () => {
    if (productListRef.current && productListRef.current.clearSelection) {
      productListRef.current.clearSelection();
    }
  };

  const clearSelectedProductNos = () => setSelectedProductNos([]);
  
  // ⭐ 3. 상태변경으로 인해 useEffect 가 실행 
  // ⭐ 4. loadProducts 함수가 새로운 검색 조건에 따라 데이터를 api에서 가져옴
  // 상품 로드
  useEffect(() => {
    loadProducts();
  }, [pagination.page, search.type, search.keyword]);

  // 카테고리 로드
  useEffect(() => {
    loadCategories(setCategoryMap);
  }, []);       // 빈배열 사용하여 컴포넌트가 처음 마운트 될 때만 실행

  // ⭐ 1. 사용자가 검색 조건을 입력하고 검색 버튼 클릭 시
  // ⭐ 2. handleSearch 함수가 호출되어 search, pagination.page 상태 업데이트
  const handleSearch = (type, keyword) => {
    console.log('Search Type:', type);
    console.log('Search Keyword:', keyword);
    setSearch({ type, keyword });
    setPagination((prev) => ({ ...prev, page: 1 }));      // 페이지 초기화

  };

  // ⭐ 5. 가져온 데이터는 users와 pagination 상태를 업데이트 하여 화면에 반영 
  const loadProducts = async () => {
    // 동적으로 params 생성
    const params = {
      type: search.type || '', // 전체를 선택했을 때 cNo를 null로 설정
      keyword: search.keyword || '', // 검색어
      page: pagination.page, // 페이지 시작 인덱스
      size: pagination.size, // 페이지 크기
    };

    console.log('Loading products with params:', params); // ✅ 로딩 파라미터 확인용 로그

    try {
      const response = await fetchProducts(params);
      console.log('API Response:', response); // ✅ API 응답 확인용 로그
      const data = response.data || {};
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, size: 10, total: 0 });
      setCategoryMap(data.categoryMap || {});
      setSearch({ type: data.type || '', keyword: data.keyword || '' });
    } catch (error) {
      console.error('Error fetching products:', error); // 에러 로그 추가
    }
  };

  // 체크박스 변경 감지 
  const handleCheckboxChange = (productNo, checked) => {
    setSelectedProductNos(prev =>
      checked ? [...prev, productNo] : prev.filter(no => no !== productNo)
    );
  };


  const handleDelete = async (productNos) => {
    if (Array.isArray(productNos)) {
      for (const no of productNos) {
        await deleteProduct(no);
      }
    } else {
      await deleteProduct(productNos);
    }
    loadProducts();
    clearSelection();
  };

  const handleEditClick = () => {
    if (selectedProductNos.length === 0) {
      alert('수정할 상품을 선택하세요.');
      return;
    }
    if (selectedProductNos.length > 1) {
      alert('수정할 상품을 한 개만 선택해주세요.');
      return;
    }
    const product = products.find(p => p.no === selectedProductNos[0]);
    if (product) {
      setSelectedProduct(product); // 선택된 상품 상태 업데이트
      setModalMode('edit'); // 모달 타입을 'edit'로 설정
      console.log('Editing product:', product);
      openModal('edit', product); // 모달 열기
    }
  };

  const openModal = (mode, product) => {
    setModalMode(mode);
    setSelectedProduct(product || null);
    setModalOpen(true);
    console.log('Opening modal:', mode, product);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async (productData) => {
    console.log('handleSave 호출', productData); // 저장할 상품 데이터 확인용 로그
    // FormData로 변환해서 백엔드 요청 (multipart-formdata 라서!)
    const formData = new FormData();
    for (const key in productData) {

      // 프론트에서 사용하는 키(소문자로 구성)와 백에서 사용하는 키(카멜케이스) 매핑
      // 예: cno → cNo, pname → pName, pprice → pPrice 등으로 변환 시켜서 formdata 전송
      let formKey = key; 
      if (key === "cno") formKey = "cNo"; // 대문자로 변환
      if (key === "pname") formKey = "pName"; // 대문자로 변환
      if (key === "pprice") formKey = "pPrice"; // 대문자로 변환

      // key : cno, pname, imageFile 등 각 필드 명 
      // productData[key] : 10, "콜라", "파일 객체" 등 각 필드의 값
      // productData["cno"] → 10
      // productData["pname"] → "콜라"
      // productData["imageFile"] → 파일 객체
      if (productData[key] !== undefined && productData[key] !== null) {
        formData.append(formKey, productData[key]);
        console.log(formKey, productData[key]);
      }
    }
    if (modalMode === 'register') {
      const response = await saveProduct(formData);
    } else if (modalMode === 'edit') {
      const response = await updateProduct(formData);
    }
    // closeModal();
    loadProducts();
  };


  // 카테고리 데이터 로드
  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      console.log('Fetched Categories:', response.data);    // API 응답 데이터 
      const categories = response.data.categories || [];
      const categoryMap = categories.reduce((map, categories) => {
        map[categories.no] = categories.cname;             // key: no, value: name
        return map;
      }, {});
      console.log('**Category Map**:', categoryMap);      // 카테고리 맵 확인용 로그
      setCategoryMap(categoryMap);       // 상태 업데이트
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  // 카테고리 등록
  const handleAddCategory = async (newCategory) => {
    try {
      console.log("New Category:", newCategory);
      const categoryData = {
        "cname": newCategory, // 카테고리 이름
        "no": null
      }
      console.log("Adding new category:", categoryData);
      const response = await createCategory(categoryData);
      console.log('Category added:', response.data);

      // 카테고리 추가 후 리스트 다시 조회
      await loadCategories(setCategoryMap);

    } catch (error) {
      console.error('Error adding category:', error);
    }
  };
  // 카테고리 수정
  const handleEditCategory = async (no, editedName) => {
    try {
      const categoryData = {
        "cname": editedName,
        "no": no
      };
      const response = await updateCategory(categoryData);
      console.log('Category updated:', response.data);
      // 카테고리 수정 후 리스트 다시 조회
      await loadCategories(setCategoryMap);
    } catch (error) { 
      console.error('Error updating category:', error);
    }
  };
  // 카테고리 삭제 
  const handleDeleteCategory = async (no) => {
    try {
      const categoryData = {
        "no": no
      };
      const response = await deleteCategory(categoryData);
      console.log('Category deleted:', no);
      // 카테고리 삭제 후 리스트 다시 조회
      await loadCategories(setCategoryMap);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div>
      <ProductList
        ref={productListRef}
        products={products}
        selectedProductNos={selectedProductNos}
        onCheckboxChange={handleCheckboxChange}
        pagination={pagination}
        onSearch={handleSearch}
        onEdit={handleEditClick}
        onRegister={() => openModal('register')}
        onDelete={handleDelete}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        categoryMap={categoryMap}
        onCategoryChange={(selectedCategory) => handleSearch(selectedCategory, '')} // 카테고리 선택 시 검색어 초기화
        onCategoryClick={() => setProductCategoryModalOpen(true)}    
        clearSelectedProductNos={clearSelectedProductNos}
      />

      {productCategoryModalOpen && (
        <ProductCategoryModal
          isOpen={productCategoryModalOpen}
          onClose={ () => setProductCategoryModalOpen(false)}
          categoryMap={categoryMap}             
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}
      {modalOpen && (
        <ProductModal
          open={modalOpen}
          mode={modalMode}
          product={selectedProduct}
          categoryMap={categoryMap}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          clearSelectedProductNos={clearSelectedProductNos}
        />
      )}

    </div>
  );
};

export default ProductListContainer;