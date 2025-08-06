package com.aloha.magicpos.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.domain.Pagination;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/admin/logs")
public class LogController {

    @Autowired
    private LogService logService;

    @GetMapping("/logList")
    public String getLogList(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "type", required = false) String type,
        @RequestParam(name = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
        @RequestParam(name = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
        @RequestParam(name = "page", defaultValue = "1") int page,
        @RequestParam(name = "size", defaultValue = "10") int size,
        HttpServletRequest request,
        Model model
    ) throws Exception {
        List<Map<String, Object>> logList;
        long total = 0;

        if (startDate == null) startDate = LocalDate.now();
        if (endDate == null) endDate = LocalDate.now();
        if (type == null) type = "";

        String start = startDate.toString();
        String end = endDate.toString();
        int index = (page - 1) * size;

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

        Pagination pagination = new Pagination(page, size, 10, total);

        model.addAttribute("logList", logList);
        model.addAttribute("keyword", keyword);
        model.addAttribute("type", type);
        model.addAttribute("startDate", startDate);
        model.addAttribute("endDate", endDate);
        model.addAttribute("pagination", pagination);
        
        boolean isAjax = "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
        log.info("조회된 로그 수: {} / 전체: {} (AJAX: {})", logList.size(), total, isAjax);
        log.info("📌 현재 페이지: {}", page);
        log.info("📌 페이지네이션 객체: {}", pagination);

        if (isAjax) {
            // ✅ AJAX 요청이면 fragment만 반환
            return "pages/admin/admin_log_list :: logTableFragment";
        }

        return "pages/admin/admin_log_list"; // ✅ 일반 접근이면 전체 페이지

    }
}
