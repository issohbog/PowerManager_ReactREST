package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import com.aloha.magicpos.domain.Products;

public interface ProductService {
    // 상품 등록
    public boolean insert(Products product) throws Exception;

    // 상품 수정
    public boolean update(Products product) throws Exception;

    // 상품 삭제
    public boolean delete(Long no) throws Exception;

    // 전체 상품 수 
    public int countProducts(String type, String keyword);

    // 전체 상품 조회
    public List<Products> findAllforAdmin(int index, int size) throws Exception;

    // 🔍 상품 검색 (분류 + 키워드) throws Exception
    public List<Products> searchProductsforAdmin(Long cNo, String keyword, int index, int size) throws Exception;

    // 카테고리로 상품 조회
    public List<Products> findProductsByCategory(Long cNo, int index, int size) throws Exception;

    // 전체 상품 조회
    public List<Products> findAll() throws Exception;

    // 단건 조회
    public Products findById(Long no) throws Exception;

    // 카테고리로 조회
    public List<Products> findByCategory(Long cNo) throws Exception;

    // 상품 단건에 대해 당일 판매량 조회 
    public Map<Long, Long> findTodaySalesMap();

    // 재고 감소
    public boolean decreaseStock(Long pNo, Long quantity) throws Exception;

    // 재고 증가
    public boolean increaseStock(Long pNo, Long quantity) throws Exception;

    // 재고 수정 
    public boolean updateStock(Long pNo, int newStock) throws Exception;

    // 🔍 상품 검색 (분류 + 키워드) throws Exception
    public List<Products> searchProducts(Long cNo, String keyword) throws Exception;

    // 🔍 상품 통합 검색
    public List<Products> searchProductsAll(String keyword) throws Exception;

    // 상품 재고 조회
    public Long selectStockByPNo(Long pNo) throws Exception;

    // 상품 리스트 + 분류 이름 조회
    List<Map<String, Object>> getProductListWithCategory() throws Exception;

    // 전체 검색
    List<Map<String, Object>> searchProductsAllWithCategory(String keyword);

    // 카테고리별 상품 조회
    List<Map<String, Object>> findProductsByCategoryWithCategoryName(Long categoryNo);

}
