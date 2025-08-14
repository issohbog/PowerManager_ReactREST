package com.aloha.magicpos.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface SaleMapper {

    // 기간별 주문 매출 조회
    List<Map<String, Object>> findOrderSales(@Param("start") String start, @Param("end") String end);

    // 기간별 이용권 매출 조회
    List<Map<String, Object>> findTicketSales(@Param("start") String start, @Param("end") String end);

    // 상위 3개 상품 조회
    List<Map<String, Object>> findTopProducts(@Param("start") String start, @Param("end") String end);

    // 하위 3개 상품 조회
    List<Map<String, Object>> findWorstProducts(@Param("start") String start, @Param("end") String end);
}
