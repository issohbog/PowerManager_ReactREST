import api from "./axios";

// 상품 목록 조회
export const fetchProducts = (params) => api.get('/products/admin/productlist', { params });

// 상품 등록
export const saveProduct = (productData) => api.post('/products/admin/create', productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 상품 정보 수정
export const updateProduct = (productData) => api.put('/products/admin/update', productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 상품 단건 삭제
export const deleteProduct = (no) => api.delete(`/products/admin/${no}/delete`);

// 상품 다건 삭제
export const deleteProducts = (productNos) => api.delete('/products/admin/deleteAll', { data: productNos });


// 상품 분류 목록 조회
export const fetchCategories = () => api.get('/categories/admin/getall');

// 상품 분류 등록
export const createCategory = (categoryData) => api.post('/categories/admin/create', categoryData);

// 상품 분류 수정
export const updateCategory = (categoryData) => api.put('/categories/admin/update', categoryData);

// 상품 분류 삭제
export const deleteCategory = (categoryData) => api.delete(`/categories/admin/delete`, { data: categoryData });