package com.aloha.magicpos.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.Carts;
import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.domain.Seats;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.CategoryService;
import com.aloha.magicpos.service.OrderService;
import com.aloha.magicpos.service.ProductService;
import com.aloha.magicpos.service.SeatReservationService;
import com.aloha.magicpos.service.SeatService;
import com.aloha.magicpos.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@RequiredArgsConstructor
@Slf4j
@RestController
public class AdminController {


    private final SeatService seatService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CartService cartService;

    @Autowired
    private SeatReservationService seatReservationService;


    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> findAllSeat() throws Exception {
        
        Map<String, List<Seats>> seatMap = seatService.getSeatSections();

        Map<String, Object> result = new HashMap<>();
        result.put("topSeats", seatMap.get("topSeats"));
        result.put("middleSeats", seatMap.get("middleSeats"));
        result.put("bottomSeats", seatMap.get("bottomSeats"));

        List<Map<String, Object>> currentUsage = seatReservationService.findCurrentSeatUsage();
        result.put("currentUsage", currentUsage);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/admin/seats/clear/{seatId}")
    @ResponseBody
    public String O(@PathVariable("seatId") String seatId) {
        try {
            boolean result = seatService.clearSeat(seatId);
            return result ? "success" : "fail";
        } catch (Exception e) {
            return "error";
        }   
    }

    // 카테고리 불러오기
    @GetMapping("/admin/categories/json")
    @ResponseBody
    public List<Categories> getAllCategories() throws Exception {
        return categoryService.findAll();
    }
    

    // 주문 등록
    @PostMapping("/admin/sellcounter/create")
    @ResponseBody
    public ResponseEntity<String> insertOrder(
        HttpServletRequest request,
        @RequestParam(value = "seatId", required = false) String seatId,
        @RequestParam(value = "pNoList", required = false) List<String> pNoList,
        @RequestParam(value = "quantityList", required = false) List<String> quantityListRaw,
        @RequestParam(value = "pNameList", required = false) List<String> pNameList,
        @RequestParam(value = "payment", required = false) String payment,
        @RequestParam(value = "stockList", required = false) List<String> stockList,
        @RequestParam(value = "totalPrice", required = false) String totalPrice,
        HttpSession session
    ) throws Exception {

        log.info("🔥🔥🔥 insertOrder 진입됨");

        Map<String, String[]> paramMap = request.getParameterMap();
        paramMap.forEach((k, v) -> log.info("{} = {}", k, Arrays.toString(v)));

        // ✅ quantityListRaw → quantityList (Long 타입으로 파싱)
        List<Long> quantityList = new ArrayList<>();
        for (String q : quantityListRaw) {
            try {
                quantityList.add(Long.parseLong(q));
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("수량 파싱 오류: " + q);
            }
        }

        // ✅ 유효성 검사
        if (pNoList == null || quantityList == null || pNameList == null || stockList == null ||
            pNoList.size() != quantityList.size() || 
            pNoList.size() != pNameList.size() || 
            pNoList.size() != stockList.size()) {
            return ResponseEntity.status(400).body("잘못된 요청입니다: 항목 수 불일치");
        }

        // ✅ 디버깅용 로그
        log.info("seatId = {}", seatId);
        log.info("pNoList = {}", pNoList);
        log.info("quantityList = {}", quantityList);
        log.info("pNameList = {}", pNameList);
        log.info("payment = {}", payment);
        log.info("stockList = {}", stockList);

        // ✅ 세션 유저 설정 (안전하게 변환)
        Object userNoObj = session.getAttribute("userNo");
        Long userNo = null;
        if (userNoObj instanceof Integer) {
            userNo = ((Integer) userNoObj).longValue();
        } else if (userNoObj instanceof Long) {
            userNo = (Long) userNoObj;
        } else if (userNoObj != null) {
            userNo = Long.valueOf(userNoObj.toString());
        }
        if (userNo == null) {
            userNo = 1L; // 테스트용 기본값
            session.setAttribute("userNo", userNo);
        }

        // ✅ 재고 확인
        for (int i = 0; i < pNoList.size(); i++) {
            Long quantity = quantityList.get(i);
            String pName = pNameList.get(i);
            Long stock = Long.parseLong(stockList.get(i)); // String을 Long으로 변환

            if (stock == null || stock < quantity) {
                return ResponseEntity.status(400).body(pName + "의 재고가 부족합니다.");
            }
        }

        // ✅ 주문 저장
        Orders order = new Orders();
        order.setUNo(userNo);
        order.setOrderStatus(0L);
        order.setPaymentStatus(0L);
        order.setSeatId(seatId);
        order.setPayment(payment);
        order.setTotalPrice(Long.parseLong(totalPrice)); // String을 Long으로 변환
        order.setMessage("");

        boolean inserted = orderService.insertOrder(order);
        log.info("🧩 inserted 결과: {}", inserted);
        log.info("🧾 order.getNo(): {}", order.getNo());
        // if (!inserted) return ResponseEntity.status(500).body("주문 저장 실패");

        log.info("✅ insertOrder 끝까지 왔다");

        // ✅ 주문 상세 등록
        Long oNo = order.getNo();
        log.info("🧾 주문 번호: {}", oNo);
        log.info("🛒 상품 {}개 상세 등록 시도 중...", pNoList.size());

        for (int i = 0; i < pNoList.size(); i++) {
            OrdersDetails detail = new OrdersDetails();
            detail.setONo(oNo);
            detail.setPNo(Long.parseLong(pNoList.get(i))); // String을 Long으로 변환
            detail.setQuantity(quantityList.get(i));

            orderService.insertOrderDetail(oNo, detail);
            productService.decreaseStock(Long.parseLong(pNoList.get(i)), quantityList.get(i));
        }

        // ✅ 장바구니 비우기
        cartService.deleteAllByUserNo(userNo);

        return ResponseEntity.ok("success");
    }


    

    /**
     * 관리자 주문 팝업 - 주문 취소
     * @param orderNo
     * @param model
     * @return
     * @throws Exception 
     */
    @GetMapping("/admin/cancel/{orderNo}")
    public String cancelOrderPopup(@PathVariable("orderNo") Long orderNo, Model model) throws Exception {

        Orders order = orderService.findOrderByNo(orderNo);
        List<Map<String, Object>> orderDetails = orderService.findDetailsWithProductNames(orderNo); // ← 여기 수정!

        model.addAttribute("order", order);
        model.addAttribute("orderDetails", orderDetails);

        return "fragments/admin/modal/orderCancel :: orderCancel";
    }

    // 사용중 회원 리스트
    @GetMapping("/admin/users/search")
    public Map<String, Object> getUserListModal(@RequestParam(name = "keyword", required = false) String keyword) {
        List<Map<String, Object>> users = seatService.searchActiveUsers(keyword);
        log.info("🧪 조회된 사용자 수: {}", users.size());
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("userList", users);
        result.put("totalCount", users.size());
        result.put("keyword", keyword);
        result.put("message", users.isEmpty() ? "사용 중인 회원이 없습니다" : "검색 완료");
        return result;
    }


    @PostMapping("/admin/orders/temp")
    @ResponseBody
    public String saveAdminTempOrder(@RequestBody Map<String, Object> tempOrder, HttpSession session) {
        session.setAttribute("tempOrder", tempOrder);
        return "ok";
    }
}


