package com.aloha.magicpos.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

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
@Controller
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


    // @GetMapping("/")
    // public String showLoginPage() {
    //     return "login"; // templates/login.html 로 이동
    // }

    // @GetMapping("/login")
    // public String loginPage() {
    //     return "login"; // templates/login.html
    // }

    @Autowired
    private TicketService ticketService;


    /**
     * Swagger UI로 리다이렉트
     * @return
     */    
    @GetMapping({"/home"})
    public String home() {
        return "redirect:/swagger-ui/index.html";
    }




    @GetMapping({"/menu", "/menu/search"})
    public String menulist(@RequestParam(name = "selectedCategory", required = false) Long selectedCategory, @RequestParam(name = "keyword", required = false) String keyword, Model model, HttpSession session) throws Exception {



        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUser customUser = (CustomUser) auth.getPrincipal();           // CustomUser로 캐스팅
        Long userNo = customUser.getUser().getNo();                         // 실제 Users 객체에서 no 추출
        log.info("✅ 로그인한 사용자 번호 (userNo): {}", userNo);

        // 세션에 userNo 추가 0725-1
        session.setAttribute("userNo", userNo);

        // ✅ 3. userNo로 모든 사용자 정보 + 좌석 정보 + 남은 시간 조회

        Map<String, Object> usageInfo = seatReservationService.findSeatReserveByUser(userNo);


        log.info("usageInfo : {}", usageInfo);

        // null 값에 기본값 세팅
        if (usageInfo.get("seat_id") == null) usageInfo.put("seat_id", "");
        if (usageInfo.get("user_no") == null) usageInfo.put("user_no", "");
        if (usageInfo.get("username") == null) usageInfo.put("username", "비회원");
        if (usageInfo.get("remain_time") == null) usageInfo.put("remain_time", "00:00");
        if (usageInfo.get("start_time") == null) usageInfo.put("start_time", "");
        if (usageInfo.get("end_time") == null) usageInfo.put("end_time", "");

        model.addAttribute("usageInfo", usageInfo);
        log.info("usageinfo : {}" ,usageInfo);


        // ✅ 4. 카테고리 불러오기
        List<Categories> categories = categoryService.findAll(); // 전체 카테고리 불러오기
        model.addAttribute("categories", categories);
        model.addAttribute("selectedCategory", selectedCategory);


        // ✅ 5. 상품 목록 조회(검색 기능 포함)
        List<Products> products;
        if (keyword != null && !keyword.trim().isEmpty()) {
            products = productService.searchProductsAll(keyword);
        } else {
            products = productService.findByCategory(selectedCategory != null ? selectedCategory : 1L); // 기본 카테고리로 1번 카테고리 설정
        }
        model.addAttribute("products", products);
        // -------------------------------------------------------------------
        // 장바구니
        List<Map<String, Object>> cartList = cartService.getCartWithProductByUser(userNo);
        if (cartList == null) {
            cartList = new ArrayList<>();
        }
        model.addAttribute("cartList", cartList);

        // 장바구니 총 주문 금액
        int totalPrice = cartService.getTotalPrice(userNo);
        model.addAttribute("totalPrice", totalPrice);
 
        // 모달. 주문 목록
        List<Orders> orderList = orderService.findOrdersByUser(userNo);
        log.info("🧪 주문 목록: {}", orderList);
        log.info("🧪 주문 개수: {}", (orderList != null ? orderList.size() : "null"));

        // 진행중인 주문 목록 개수 : status != 2
        long ongoingOrdersCount = orderList.stream().filter(order -> order.getOrderStatus() != 2).count();
        List<Orders> ongoingOrderList = orderList.stream().filter(order -> order.getOrderStatus() != 2).toList();
        model.addAttribute("ongoingOrdersCount", ongoingOrdersCount);
        model.addAttribute("ongoingOrderList", ongoingOrderList);

        // 히스토리 주문 목록 개수 : status = 2
        long historyOrdersCount = orderList.stream().filter(order -> order.getOrderStatus() == 2).count();
        List<Orders> historyOrderList = orderList.stream().filter(order -> order.getOrderStatus() == 2).toList();
        model.addAttribute("historyOrdersCount", historyOrdersCount);
        model.addAttribute("historyOrderList", historyOrderList);

        model.addAttribute("orderList", orderList);



        // 모달. 각 주문에 대한 상세 내역 묶기
        Map<Long, List<Map<String, Object>>> orderDetailsMap = new HashMap<>();
        for (Orders order : orderList) {
            Long oNo = order.getNo();
            List<Map<String, Object>> details = orderService.findDetailsWithProductNames(oNo);
            if (details == null || details.isEmpty()) {
                log.warn("❗ 주문 상세 없음: orderNo = {}", oNo);
                details = new ArrayList<>();
            }
            orderDetailsMap.put(oNo, details);
        }
        model.addAttribute("orderDetailsMap", orderDetailsMap);


        // 요금제 모달 
        List<Tickets> ticketList = ticketService.findAll();    
        model.addAttribute("ticketList", ticketList);

        // 좌석 사용 시간 계산
        Map<String, Object> seatInfo = seatReservationService.findSeatReserveByUser(userNo);
        // long usedMinutes = (long) seatInfo.getOrDefault("used_time", 0L);
        // long remainMinutes = (long) seatInfo.getOrDefault("remain_time", 0L);
        long usedMinutes = ((Number) seatInfo.getOrDefault("used_time", 0)).longValue();
        long remainMinutes = ((Number) seatInfo.getOrDefault("remain_time", 0)).longValue();


        model.addAttribute("usedTime", usedMinutes);
        model.addAttribute("remainTime", remainMinutes);

        return "menu";
    }
    @PostMapping("/users/orders/temp")
    @ResponseBody
    public void storeTempOrder(@RequestBody Map<String, Object> params, HttpSession session) {
        session.setAttribute("tempOrder", params);
    }

}
