package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.mapper.SaleMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SaleServiceImpl implements SaleService {

    @Autowired private SaleMapper saleMapper;

    // 기간별 주문 매출
    @Override
    public List<Map<String, Object>> findOrderSales(String start, String end) throws Exception {
        return saleMapper.findOrderSales(start, end);
    }
    
    // 기간별 이용권 매출
    @Override
    public List<Map<String, Object>> findTicketSales(String start, String end) throws Exception {
        return saleMapper.findTicketSales(start, end);
    }
    
    // 상위 3개 상품
    @Override
    public List<Map<String, Object>> findTopProducts(String start, String end) throws Exception {
        log.info("Finding top products from {} to {}", start, end);
        return saleMapper.findTopProducts(start, end);
    }
    
    // 하위 3개 상품
    @Override
    public List<Map<String, Object>> findWorstProducts(String start, String end) throws Exception {
        log.info("Finding worst products from {} to {}", start, end);
        return saleMapper.findWorstProducts(start, end);
    }
}
