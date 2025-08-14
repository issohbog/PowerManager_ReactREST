package com.aloha.magicpos.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.Products;

@Mapper
public interface ProductMapper {
    // 상품 등록
    int insert(Products product);

    // 상품 수정
    int update(Products product);

    // 상품 삭제
    int delete(@Param("no") Long no);

    // 전체 상품 수 
    int countAll();

    // type을 category로 매칭해서 검색후 조건 만족하는 상품 수 (페이지 네이션용)
    int countByCategoryAndKeyword(@Param("cNo") Long cNo, @Param("keyword") String keyword);

    // 상품 검색 (분류 + 키워드 + 페이지네이션)
    List<Products> searchProductsforAdmin(@Param("cNo") Long cNo, @Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);

    // 카테고리로 상품 조회 (페이지네이션)
    List<Products> findProductsByCategory(@Param("cNo") Long cNo, @Param("index") int index, @Param("size") int size);

    // 상품 전체 조회 (페이지네이션)
    List<Products> findAllforAdmin(@Param("index") int index, @Param("size") int size);

    // 전체 상품 조회
    List<Products> findAll();

    // 단건 조회
    Products findById(@Param("no") Long no);

    // 카테고리로 조회
    List<Products> findByCategory(@Param("cNo") Long cNo);

    // 🔍 상품 검색 (분류 + 키워드)
    List<Products> searchProducts(@Param("cNo") Long cNo, @Param("keyword") String keyword);

    // 🔍 상품 통합 검색
    List<Products> searchProductsAll(@Param("keyword") String keyword);

    // 상품 단건에 대해 당일 판매량 조회 
    List<Map<String, Object>> findTodaySalesMap();

    // 재고 감소
    int decreaseStock(@Param("pNo") Long pNo, @Param("quantity") Long quantity);

    // 재고 증가
    int increaseStock(@Param("pNo") Long pNo, @Param("quantity") Long quantity);

    // 재고 수정 
    int updateStock(@Param("pNo") Long pNo, @Param("stock") int stock);


    // 상품 재고 조회
    Long selectStockByPNo(@Param("pNo") Long pNo);

    // 상품 리스트 + 분류 이름
    List<Map<String, Object>> getProductListWithCategory();

    // 전체 검색
    List<Map<String, Object>> searchProductsAllWithCategory(String keyword);

    // 카테고리별 상품 조회
    List<Map<String, Object>> findProductsByCategoryWithCategoryName(Long categoryNo);

}
