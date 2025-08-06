package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;


public interface TodayHistoryService {
    // ✅ 오늘 전체 결제 내역 (주문 + 이용권)
    List<Map<String, Object>> findTodayAll(int index, int size) throws Exception;

    // ✅ 분류별 내역 조회
    List<Map<String, Object>> findTodayOrdersOnly(int index, int size) throws Exception;
    List<Map<String, Object>> findTodayTicketsOnly(int index, int size) throws Exception;

    // ✅ 전체 내역에서 검색
    List<Map<String, Object>> searchTodayAll(String keyword, int index, int size) throws Exception;

    // ✅ 주문결제 내역에서 검색
    List<Map<String, Object>> searchTodayOrders(String keyword, int index, int size) throws Exception;

    // ✅ 이용권구매 내역에서 검색
    List<Map<String, Object>> searchTodayTickets(String keyword, int index, int size) throws Exception;

    // ✅ 페이지네이션용 전체 개수
    long countTodayAll() throws Exception;
    long countSearchTodayAll(String keyword) throws Exception;
    long countTodayOrders(String keyword) throws Exception;
    long countTodayTickets(String keyword) throws Exception;
}
