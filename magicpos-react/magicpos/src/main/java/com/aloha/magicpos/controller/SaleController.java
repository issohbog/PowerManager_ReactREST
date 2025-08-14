package com.aloha.magicpos.controller;

import com.aloha.magicpos.service.SaleService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin/sales")
public class SaleController {

    @Autowired
    private SaleService saleService;

    // 기간별 주문 매출
    @GetMapping("/orders")
    public List<Map<String, Object>> getOrderSales(
            @RequestParam("start") String start,
            @RequestParam("end") String end) throws Exception {
        return saleService.findOrderSales(start, end);
    }

    // 기간별 이용권 매출
    @GetMapping("/tickets")
    public List<Map<String, Object>> getTicketSales(
            @RequestParam("start") String start,
            @RequestParam("end") String end) throws Exception {
        return saleService.findTicketSales(start, end);
    }

    // 상위 3개 상품
    @GetMapping("/top-products")
    public List<Map<String, Object>> getTopProducts(
            @RequestParam("start") String start,
            @RequestParam("end") String end) throws Exception {
        return saleService.findTopProducts(start, end);
    }

    // 하위 3개 상품
    @GetMapping("/worst-products")
    public List<Map<String, Object>> getWorstProducts(
            @RequestParam("start") String start,
            @RequestParam("end") String end) throws Exception {
        return saleService.findWorstProducts(start, end);
    }
}
