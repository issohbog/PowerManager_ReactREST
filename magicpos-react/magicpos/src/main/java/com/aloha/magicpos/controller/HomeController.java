package com.aloha.magicpos.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.Products;
import com.aloha.magicpos.domain.Tickets;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.CategoryService;
import com.aloha.magicpos.service.OrderService;
import com.aloha.magicpos.service.ProductService;
import com.aloha.magicpos.service.SeatReservationService;
import com.aloha.magicpos.service.SeatService;
import com.aloha.magicpos.service.TicketService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class HomeController {
    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private SeatService seatService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;


    @Autowired
    private SeatReservationService seatReservationService;



    @Autowired
    private TicketService ticketService;



    @GetMapping({"/menu", "/menu/search"})
    public ResponseEntity<Map<String, Object>> menulistRest(@RequestParam(name = "selectedCategory", required = false) Long selectedCategory, @RequestParam(name = "keyword", required = false) String keyword, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 인증 없이 테스트하기 위해 임시로 고정값 사용
            Long userNo = 1L;
            
            // 또는 세션에서 안전하게 가져오는 방법:
            /*
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof CustomUser) {
                CustomUser customUser = (CustomUser) auth.getPrincipal();
                userNo = customUser.getUser().getNo();
            } else {
                userNo = 1L; // 기본값
            }
            */
            
            session.setAttribute("userNo", userNo);

            Map<String, Object> usageInfo = seatReservationService.findSeatReserveByUser(userNo);
            if (usageInfo.get("seat_id") == null) usageInfo.put("seat_id", "50");
            if (usageInfo.get("user_no") == null) usageInfo.put("user_no", userNo);
            if (usageInfo.get("username") == null) usageInfo.put("username", "테스트유저");
            if (usageInfo.get("remain_time") == null) usageInfo.put("remain_time", "02:30");
            if (usageInfo.get("start_time") == null) usageInfo.put("start_time", "");
            if (usageInfo.get("end_time") == null) usageInfo.put("end_time", "");
            result.put("usageInfo", usageInfo);

            List<Categories> categories = categoryService.findAll();
            result.put("categories", categories);
            result.put("selectedCategory", selectedCategory);

            List<Products> products;
            if (keyword != null && !keyword.trim().isEmpty()) {
                products = productService.searchProductsAll(keyword);
            } else {
                products = productService.findByCategory(selectedCategory != null ? selectedCategory : 1L);
            }
            result.put("products", products);

            List<Map<String, Object>> cartList = cartService.getCartWithProductByUser(userNo);
            if (cartList == null) cartList = new ArrayList<>();
            result.put("cartList", cartList);

            int totalPrice = cartService.getTotalPrice(userNo);
            result.put("totalPrice", totalPrice);

            List<Orders> orderList = orderService.findOrdersByUser(userNo);
            result.put("orderList", orderList);

            long ongoingOrdersCount = orderList.stream().filter(order -> order.getOrderStatus() != 2).count();
            List<Orders> ongoingOrderList = orderList.stream().filter(order -> order.getOrderStatus() != 2).toList();
            result.put("ongoingOrdersCount", ongoingOrdersCount);
            result.put("ongoingOrderList", ongoingOrderList);

            long historyOrdersCount = orderList.stream().filter(order -> order.getOrderStatus() == 2).count();
            List<Orders> historyOrderList = orderList.stream().filter(order -> order.getOrderStatus() == 2).toList();
            result.put("historyOrdersCount", historyOrdersCount);
            result.put("historyOrderList", historyOrderList);

            Map<Long, List<Map<String, Object>>> orderDetailsMap = new HashMap<>();
            for (Orders order : orderList) {
                Long oNo = order.getNo();
                List<Map<String, Object>> details = orderService.findDetailsWithProductNames(oNo);
                if (details == null || details.isEmpty()) {
                    details = new ArrayList<>();
                }
                orderDetailsMap.put(oNo, details);
            }
            result.put("orderDetailsMap", orderDetailsMap);

            List<Tickets> ticketList = ticketService.findAll();
            result.put("ticketList", ticketList);

            Map<String, Object> seatInfo = seatReservationService.findSeatReserveByUser(userNo);
            long usedMinutes = ((Number) seatInfo.getOrDefault("used_time", 0)).longValue();
            long remainMinutes = ((Number) seatInfo.getOrDefault("remain_time", 0)).longValue();
            result.put("usedTime", usedMinutes);
            result.put("remainTime", remainMinutes);

            result.put("success", true);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    @PostMapping("/users/orders/temp")
    public ResponseEntity<Map<String, Object>> storeTempOrderRest(@RequestBody Map<String, Object> params, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            session.setAttribute("tempOrder", params);
            result.put("success", true);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

}
