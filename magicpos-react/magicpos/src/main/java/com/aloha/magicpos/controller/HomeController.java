package com.aloha.magicpos.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
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
import com.aloha.magicpos.domain.Users;
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

    // 사용자 정보용 DTO
    public record MeDto(
        Long no,
        String id,
        String username,
        String email,
        List<String> roles,
        Long usedMin,
        Long remainMin
        ) {}
        
    // 사용자 정보 꺼내쓰기
    @GetMapping("/api/me")
    public MeDto me(@AuthenticationPrincipal CustomUser cu) {
        var u = cu.getUser();
        var roles = cu.getAuthorities().stream()
            .map(a -> a.getAuthority()).toList();
        return new MeDto(
            u.getNo(), u.getId(), u.getUsername(), u.getEmail(),
            roles, u.getUsedMin(), u.getRemainMin()
        );
    }

    /**
     * Swagger UI로 리다이렉트
     * @return
     */    
    @GetMapping({"/home"})
    public String home() {
        return "redirect:/swagger-ui/index.html";
    }




    @GetMapping({"/menu", "/menu/search"})
    public ResponseEntity<Map<String, Object>> menulistRest(
            @RequestParam(name = "selectedCategory", required = false) Long selectedCategory,
            @RequestParam(name = "keyword", required = false) String keyword) {

        Map<String, Object> result = new HashMap<>();

        try {
            // 1) 인증에서 userNo 안전 획득
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
            }

            Object principal = auth.getPrincipal();
            if (!(principal instanceof CustomUser cu)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
            }
            // Long userNo = cu.getUser().getNo();
            // String loginUsername = cu.getUser().getUsername();
            Users user = cu.getUser();

            log.info("User No: {}", user.getNo());
            log.info("Username: {}", user.getUsername());

            // 1) 사용자 정보 조회
            Long userNo = user.getNo();
            String loginUsername = user.getUsername();

            // 2) 좌석/사용 정보 조회 (널 가드)
            Map<String, Object> usageInfoRaw = seatReservationService.findSeatReserveByUser(userNo);
            if (usageInfoRaw == null) usageInfoRaw = new HashMap<>();

            // 화면 표시용 기타 필드(문자열)는 비어있으면 기본값
            String seatId   = strOrDefault(usageInfoRaw.get("seat_id"), "");
            String username = strOrDefault(usageInfoRaw.get("username"), loginUsername); // ← 기본값을 로그인 유저명으로
            String start    = strOrDefault(usageInfoRaw.get("start_time"), "");
            String end      = strOrDefault(usageInfoRaw.get("end_time"), "");
            long usedMinutes   = toLong(usageInfoRaw.get("used_time"), 0L);
            long remainMinutes = Math.max(0L, toLong(usageInfoRaw.get("remain_time"), 0L)); // 음수 방지

            // 프론트 혼란 줄이려고 usageInfo도 카멜케이스 + 의미명으로 묶어서 내려줌
            Map<String, Object> usageInfo = new HashMap<>();
            usageInfo.put("seatId", seatId);
            usageInfo.put("userNo", userNo);
            usageInfo.put("username", username);
            usageInfo.put("startTime", start);
            usageInfo.put("endTime", end);
            usageInfo.put("remainMinutes", remainMinutes);
            usageInfo.put("usedMinutes", usedMinutes);
            result.put("usageInfo", usageInfo);

            log.info("usageInfo userNo: {}", usageInfo.get("userNo"));

            // 3) 카테고리/상품
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

            // 4) 장바구니
            List<Map<String, Object>> cartList = cartService.getCartWithProductByUser(userNo);
            if (cartList == null) cartList = new ArrayList<>();
            result.put("cartList", cartList);
            result.put("totalPrice", cartService.getTotalPrice(userNo));

            // 5) 주문 + 상세
            List<Orders> orderList = orderService.findOrdersByUser(userNo);
            result.put("orderList", orderList);

            long ongoingCount = orderList.stream().filter(o -> o.getOrderStatus() != 2).count();
            long historyCount = orderList.stream().filter(o -> o.getOrderStatus() == 2).count();
            result.put("ongoingOrdersCount", ongoingCount);
            result.put("historyOrdersCount", historyCount);
            result.put("ongoingOrderList", orderList.stream().filter(o -> o.getOrderStatus() != 2).toList());
            result.put("historyOrderList", orderList.stream().filter(o -> o.getOrderStatus() == 2).toList());

            Map<Long, List<Map<String, Object>>> orderDetailsMap = new HashMap<>();
            for (Orders order : orderList) {
                Long oNo = order.getNo();
                List<Map<String, Object>> details = orderService.findDetailsWithProductNames(oNo);
                orderDetailsMap.put(oNo, (details == null) ? new ArrayList<>() : details);
            }
            result.put("orderDetailsMap", orderDetailsMap);

            // 6) 이용권
            List<Tickets> ticketList = ticketService.findAll();
            result.put("ticketList", ticketList);

            // 7) 숫자 필드는 최상위에도 그대로 내려줌(일관성)
            result.put("usedTime", usedMinutes);
            result.put("remainTime", remainMinutes);

            result.put("success", true);
            return ResponseEntity.ok(result);

        } catch (ResponseStatusException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    /** 유틸: Object → long 안전 변환 */
    private long toLong(Object v, long def) {
        if (v == null) return def;
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString()); } catch (Exception ignore) { return def; }
    }

    /** 유틸: Object → String 기본값 */
    private String strOrDefault(Object v, String def) {
        return (v == null) ? def : v.toString();
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
