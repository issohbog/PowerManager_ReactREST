package com.aloha.magicpos.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.OrdersDetails;

@Mapper
public interface OrderDetailMapper {
    // 주문 상세 등록
    int insert(OrdersDetails orderDetail);

    // 수량 수정
    int updateQuantity(@Param("oNo") Long oNo, @Param("pNo") Long pNo, @Param("quantity") Long quantity);

    // 수량 증가
    int increaseQuantity(@Param("oNo") Long oNo, @Param("pNo") Long pNo);
    
    // 수량 감소
    int decreaseQuantity(@Param("oNo") Long oNo, @Param("pNo") Long pNo);

    // 주문 상세 삭제 (주문 번호 + 상품 번호)
    int delete(@Param("oNo") Long oNo, @Param("pNo") Long pNo);

    // 주문 번호 기준 전체 삭제
    int deleteByOrderNo(@Param("oNo") Long oNo);

    // 주문 번호 기준 상세 목록 조회
    List<OrdersDetails> findByOrderNo(@Param("oNo") Long oNo);

    // 주문 번호 기준 상세 목록 + 상품명/가격 조인 조회
    List<Map<String, Object>> findDetailsWithProductNamesByOrderNo(@Param("oNo") Long oNo);

    // 상품 재고 감소
    int decreaseProductStock(@Param("pNo") Long pNo, @Param("quantity") Long quantity);

    // 상품 재고 증가
    int increaseProductStock(@Param("pNo") Long pNo, @Param("quantity") Long quantity);

    // 재고 조회
    Long getQuantityByOrderAndProduct(@Param("oNo") Long oNo, @Param("pNo") Long pNo);

}
