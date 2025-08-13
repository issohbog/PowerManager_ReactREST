import axios from "axios";
axios.defaults.baseURL = "/api";

// 상품 목록 조회
export const fetchProducts = (params) => axios.get('/products/admin/productlist', { params });

// 상품 등록
export const saveProduct = (productData) => axios.post('/products/admin/create', productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 상품 정보 수정
export const updateProduct = (productData) => axios.put('/products/admin/update', productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 상품 단건 삭제
export const deleteProduct = (no) => axios.delete(`/products/admin/${no}/delete`);

// 상품 다건 삭제
export const deleteProducts = (productNos) => axios.delete('/products/admin/deleteAll', { data: productNos });


// 상품 분류 목록 조회
export const fetchCategories = () => axios.get('/categories/admin/getall');

// 상품 분류 등록
export const createCategory = (categoryData) => axios.post('/categories/admin/create', categoryData);

// 상품 분류 수정
export const updateCategory = (categoryData) => axios.put('/categories/admin/update', categoryData);

// 상품 분류 삭제
export const deleteCategory = (categoryData) => axios.delete(`/categories/admin/delete`, { data: categoryData });