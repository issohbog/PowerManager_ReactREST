package com.aloha.magicpos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.aloha.magicpos.service.TodayHistoryService;


import com.aloha.magicpos.domain.Pagination;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/history")
public class TodayHistoryController {

    
    @Autowired
    private TodayHistoryService todayHistoryService;
    
    /**
     * 오늘의 내역 리스트를 조건에 따라 페이징하여 반환 (REST API)
     */
    @GetMapping("/today")
    public ResponseEntity<?> getTodayHistoryRest(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "type", required = false) String type,
        @RequestParam(name = "page", defaultValue = "1") int page,
        @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        try {
            // 타입 기본값 처리
            if (type == null) type = "";
            if (keyword == null) keyword = "";

            List<Map<String, Object>> todayList;
            long total = 0;

            // 검색어가 있을 때와 없을 때 분기
            if (keyword != null && !keyword.isEmpty()) {
                switch (type) {
                    case "orderhistory":
                        total = todayHistoryService.countTodayOrders(keyword);
                        todayList = todayHistoryService.searchTodayOrders(keyword, (page - 1) * size, size);
                        break;
                    case "tickethistory":
                        total = todayHistoryService.countTodayTickets(keyword);
                        todayList = todayHistoryService.searchTodayTickets(keyword, (page - 1) * size, size);
                        break;
                    default:
                        total = todayHistoryService.countSearchTodayAll(keyword);
                        todayList = todayHistoryService.searchTodayAll(keyword, (page - 1) * size, size);
                }
            } else {
                switch (type) {
                    case "orderhistory":
                        total = todayHistoryService.countTodayOrders("");
                        todayList = todayHistoryService.findTodayOrdersOnly((page - 1) * size, size);
                        break;
                    case "tickethistory":
                        total = todayHistoryService.countTodayTickets("");
                        todayList = todayHistoryService.findTodayTicketsOnly((page - 1) * size, size);
                        break;
                    default:
                        total = todayHistoryService.countTodayAll();
                        todayList = todayHistoryService.findTodayAll((page - 1) * size, size);
                }
            }

            // 페이지네이션 객체 생성
            Pagination pagination = new Pagination(page, size, 10, total);

            // 응답 데이터 구성
            return org.springframework.http.ResponseEntity.ok(Map.of(
                "success", true,
                "todayList", todayList,
                "keyword", keyword,
                "type", type,
                "pagination", pagination
            ));
        } catch (Exception e) {
            // 에러 발생 시 500 반환
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
}
