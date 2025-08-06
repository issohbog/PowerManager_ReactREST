package com.aloha.magicpos.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.Carts;

@Mapper
public interface CartMapper {
    // 장바구니에 항목 추가
    int insert(Carts carts);

    // 수량 1 증가
    int increaseQuantity(@Param("uNo") Long uNo, @Param("pNo") Long pNo);

    // 수량 1 감소
    int decreaseQuantity(@Param("uNo") Long uNo, @Param("pNo") Long pNo);

    // 장바구니 항목 삭제
    int delete(@Param("cartNo") Long cartNo);

    // 사용자 장바구니 전체 조회
    List<Carts> findByUser(Long uNo);

    // 사용자 + 상품으로 항목 조회
    Carts findByUserAndProduct(@Param("uNo") Long uNo, @Param("pNo") Long pNo);

    // 사용자로 카트 조회
    List<Map<String, Object>> findCartWithProductByUser(Long uNo);

    // 전체 가격 조회
    int getTotalPrice(Long uNo);

    // 사용자 장바구니 전체 삭제
    int deleteAllByUserNo(Long userNo);

}
