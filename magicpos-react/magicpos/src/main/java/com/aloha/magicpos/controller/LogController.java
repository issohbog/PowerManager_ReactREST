package com.aloha.magicpos.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.domain.Pagination;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/logs")
public class LogController {

    @Autowired
    private LogService logService;

    /**
     * 로그 리스트를 조건에 따라 페이징하여 반환 (REST API)
     */
    @GetMapping("/logList")
    public ResponseEntity<?> getLogListRest(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "type", required = false) String type,
        @RequestParam(name = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
        @RequestParam(name = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
        @RequestParam(name = "page", defaultValue = "1") int page,
        @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        try {
            // 날짜 기본값 설정
            if (startDate == null) startDate = LocalDate.now();
            if (endDate == null) endDate = LocalDate.now();
            if (type == null) type = "";
            if (keyword == null) keyword = "";

            String start = startDate.toString(); // 시작일 문자열 변환
            String end = endDate.toString();     // 종료일 문자열 변환
            int index = (page - 1) * size;       // 페이징 인덱스 계산

            List<Map<String, Object>> logList;
            long total = 0;

            // 검색어가 있을 때와 없을 때 분기
            if (keyword != null && !keyword.isEmpty()) {
                switch (type) {
                    case "loginhistory":
                        total = logService.countSearchLoginLogsByDate(start, end, keyword);
                        logList = logService.searchLoginLogsByDate(start, end, keyword, index, size);
                        break;
                    case "joinhistory":
                        total = logService.countSearchJoinLogsByDate(start, end, keyword);
                        logList = logService.searchJoinLogsByDate(start, end, keyword, index, size);
                        break;
                    case "tickethistory":
                        total = logService.countSearchTicketLogsByDate(start, end, keyword);
                        logList = logService.searchTicketLogsByDate(start, end, keyword, index, size);
                        break;
                    case "orderhistory":
                        total = logService.countSearchProductLogsByDate(start, end, keyword);
                        logList = logService.searchProductLogsByDate(start, end, keyword, index, size);
                        break;
                    default:
                        total = logService.countSearchAllLogsByDate(start, end, keyword);
                        logList = logService.searchAllLogsByDate(start, end, keyword, index, size);
                }
            } else {
                switch (type) {
                    case "loginhistory":
                        total = logService.countLoginLogsByDate(start, end);
                        logList = logService.findLoginLogsByDate(start, end, index, size);
                        break;
                    case "joinhistory":
                        total = logService.countJoinLogsByDate(start, end);
                        logList = logService.findJoinLogsByDate(start, end, index, size);
                        break;
                    case "tickethistory":
                        total = logService.countTicketLogsByDate(start, end);
                        logList = logService.findTicketLogsByDate(start, end, index, size);
                        break;
                    case "orderhistory":
                        total = logService.countProductLogsByDate(start, end);
                        logList = logService.findProductLogsByDate(start, end, index, size);
                        break;
                    default:
                        total = logService.countLogsByDate(start, end);
                        logList = logService.findLogsByDate(start, end, index, size);
                }
            }

            // 페이지네이션 객체 생성
            Pagination pagination = new Pagination(page, size, 10, total);

            // 응답 데이터 구성
            return ResponseEntity.ok(Map.of(
                "success", true,
                "logList", logList,
                "keyword", keyword,
                "type", type,
                "startDate", startDate,
                "endDate", endDate,
                "pagination", pagination
            ));
        } catch (Exception e) {
            // 에러 발생 시 500 반환
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
