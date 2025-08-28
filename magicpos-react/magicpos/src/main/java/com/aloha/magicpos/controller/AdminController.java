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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.domain.Seats;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.CategoryService;
import com.aloha.magicpos.service.LogService;
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

    @Autowired
    private LogService logService;

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> findAllSeat() throws Exception {
        
        // 전체 좌석 조회 (위치 정보 포함)
        List<Seats> allSeats = seatService.findAllSeatWithUsage();

        Map<String, Object> result = new HashMap<>();
        
        // 새로운 방식: 전체 좌석 배열 (위치 기반 렌더링용)
        result.put("seats", allSeats);
        
        // 하위 호환성: 기존 분단별 방식 (다른 코드에서 사용할 수 있도록 유지)
        Map<String, List<Seats>> seatMap = seatService.getSeatSections();
        result.put("topSeats", seatMap.get("topSeats"));
        result.put("middleSeats", seatMap.get("middleSeats"));
        result.put("bottomSeats", seatMap.get("bottomSeats"));

        List<Map<String, Object>> currentUsage = seatReservationService.findCurrentSeatUsage();
        result.put("currentUsage", currentUsage);

        return ResponseEntity.ok(result);
    }

    // 좌석 상태 업데이트 (좌석 관리용)
    @PostMapping("/admin/seats/{seatId}/status")
    public ResponseEntity<Map<String, Object>> updateSeatStatus(
            @PathVariable("seatId") String seatId, 
            @RequestBody Map<String, String> request) throws Exception {
        
        String newStatus = request.get("status");
        log.info("좌석 상태 업데이트 요청: seatId={}, newStatus={}", seatId, newStatus);
        
        // 상태 값 변환 (프론트엔드 → DB)
        String dbStatus;
        switch (newStatus) {
            case "BROKEN":
                dbStatus = "2"; // 고장
                break;
            case "AVAILABLE":
                dbStatus = "0"; // 이용가능
                break;
            default:
                dbStatus = newStatus; // 기타 값은 그대로 전달
        }
        
        log.info("변환된 DB 상태 값: {} → {}", newStatus, dbStatus);
        boolean success = seatService.updateStatus(seatId, dbStatus);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        
        if (success) {
            result.put("message", "좌석 상태가 성공적으로 업데이트되었습니다.");
            log.info("좌석 상태 업데이트 성공: {} → {}", seatId, dbStatus);
        } else {
            result.put("message", "좌석 상태 업데이트에 실패했습니다.");
            log.error("좌석 상태 업데이트 실패: {} → {}", seatId, dbStatus);
        }
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/admin/seats/clear/{seatId}")
    public ResponseEntity<Map<String, Object>> clearSeat(@PathVariable("seatId") String seatId) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = seatService.clearSeat(seatId);
            result.put("success", success);
            result.put("message", success ? "좌석이 정상적으로 초기화되었습니다." : "좌석 초기화에 실패했습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("좌석 초기화 중 오류 발생", e);
            result.put("success", false);
            result.put("message", "좌석 초기화 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
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
        HttpSession session, @AuthenticationPrincipal CustomUser cu
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

        // ✅ 2. userNo 안전하게 변환
        Long userNo = cu.getUser().getNo();

        // 3.username 안전하게 변환
        String username = cu.getUser().getUsername();

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

        // ✅ 5. 로그 남기기
        String desc = username + "님이 " + totalPrice + "원어치 상품을 결제했습니다.";
        logService.insertLog(userNo, seatId, "상품 구매", desc);

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

    // 그룹 번호 범위 업데이트 API
    @PostMapping("/admin/groups/update-ranges")
    public ResponseEntity<Map<String, Object>> updateGroupRanges(@RequestBody List<Map<String, Object>> groupRanges) {
        try {
            log.info("그룹 범위 업데이트 요청: {}", groupRanges);
            
            boolean success = seatService.updateGroupRanges(groupRanges);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            result.put("message", success ? "그룹 범위가 성공적으로 업데이트되었습니다." : "그룹 범위 업데이트에 실패했습니다.");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("그룹 범위 업데이트 중 오류 발생", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "서버 오류: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    // 그룹별 실제 좌석 범위 조회 API
    @GetMapping("/admin/groups/ranges")
    public ResponseEntity<Map<String, Object>> getGroupRanges() {
        try {
            log.info("그룹 범위 조회 요청");
            
            List<Map<String, Object>> groupRanges = seatService.getGroupRanges();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", groupRanges);
            result.put("message", "그룹 범위 조회 성공");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("그룹 범위 조회 중 오류 발생", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "서버 오류: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
}


