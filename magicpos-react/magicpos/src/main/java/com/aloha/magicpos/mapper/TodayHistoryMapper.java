package com.aloha.magicpos.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TodayHistoryMapper {
    
     // ✅ 오늘 전체 결제 내역 (주문 + 이용권)
    List<Map<String, Object>> findTodayAll(@Param("index") int index, @Param("size") int size);

    // ✅ 분류별 내역 조회
    List<Map<String, Object>> findTodayOrdersOnly(@Param("index") int index, @Param("size") int size);
    List<Map<String, Object>> findTodayTicketsOnly(@Param("index") int index, @Param("size") int size);

    // ✅ 전체 내역에서 검색
    List<Map<String, Object>> searchTodayAll(@Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);

    // ✅ 주문결제 내역에서 검색
    List<Map<String, Object>> searchTodayOrders(@Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);

    // ✅ 이용권구매 내역에서 검색
    List<Map<String, Object>> searchTodayTickets(@Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);

    // ✅ 페이지네이션용 전체 개수
    long countTodayAll();
    long countSearchTodayAll(@Param("keyword") String keyword);
    long countTodayOrders(@Param("keyword") String keyword);
    long countTodayTickets(@Param("keyword") String keyword);
}
