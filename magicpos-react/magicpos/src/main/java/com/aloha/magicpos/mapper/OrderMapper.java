package com.aloha.magicpos.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.Orders;

@Mapper
public interface OrderMapper {
    // 주문 등록
    int insert(Orders order);

    // 주문 상태 / 결제 상태 수정
    int updateStatus(@Param("no") Long no,
                     @Param("orderStatus") Long orderStatus,
                     @Param("paymentStatus") Long paymentStatus);

    // 주문 삭제
    int delete(@Param("no") Long no);

    // 전체 주문 목록 조회
    List<Orders> findAll();

    // 특정 사용자 주문 목록 조회
    List<Orders> findByUser(@Param("uNo") Long uNo);
    
    // 단일 주문 조회
    Orders findByNo(@Param("no") Long no);


    // 특정 사용자 주문 목록 조회
    List<Orders> findOrdersByStatus(@Param("orderStatus") List<Long> orderStatus);

    Long getQuantityByOrderAndProduct(Long oNo, Long pNo);

    // 현금만 pay_at 업데이트
    void updatePayAtNow(@Param("no") Long no);
}
