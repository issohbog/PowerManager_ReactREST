package com.aloha.magicpos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.aloha.magicpos.service.TodayHistoryService;

import jakarta.servlet.http.HttpServletRequest;

import com.aloha.magicpos.domain.Pagination;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/admin/history/today")
public class TodayHistoryController {

    
    @Autowired
    private TodayHistoryService todayHistoryService;
    
@GetMapping("/all")
public String getTodayHistoryPage(
    @RequestParam(name = "keyword", required = false) String keyword,
    @RequestParam(name = "type", required = false) String type,
    @RequestParam(name = "page", defaultValue = "1") int page,
    @RequestParam(name = "size", defaultValue = "10") int size,
    HttpServletRequest request,
    Model model) throws Exception {

    List<Map<String, Object>> todayList;
    long total = 0;

    if (type == null) type = "";

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

    Pagination pagination = new Pagination(page, size, 10, total);
    model.addAttribute("todayList", todayList);
    model.addAttribute("keyword", keyword);
    model.addAttribute("type", type);
    model.addAttribute("pagination", pagination);

    boolean isAjax = "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
    log.info("조회된 오늘의 내역 수: {} / 전체: {} (AJAX: {})", todayList.size(), total, isAjax);

    if (isAjax) {
        return "pages/admin/admin_today_list :: todayTableFragment"; // 💡 fragment만 반환
    }

    return "pages/admin/admin_today_list"; // 전체 페이지
}
    
}
