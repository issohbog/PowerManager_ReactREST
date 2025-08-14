package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;


public interface SaleService {

    // 기간별 주문 매출 조회
    List<Map<String, Object>> findOrderSales(String start, String end) throws Exception;

    // 기간별 이용권 매출 조회
    List<Map<String, Object>> findTicketSales(String start, String end) throws Exception;

    // 상위 3개 상품 조회
    List<Map<String, Object>> findTopProducts(String start, String end) throws Exception;

    // 하위 3개 상품 조회
    List<Map<String, Object>> findWorstProducts(String start, String end) throws Exception;
    
}
