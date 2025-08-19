package com.aloha.magicpos.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.service.OrderService;
import com.aloha.magicpos.service.ProductService;
import com.aloha.magicpos.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/users/orders")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    @Autowired
    private LogService logService;

    @Autowired
    private UserService userService;
    
    // ✅ REST API로 변경된 주문 등록
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData, 
    @AuthenticationPrincipal CustomUser cu, HttpSession session) {
        try {
            log.info("🛒 주문 데이터 받음: {}", orderData);
            
            // ✅ 1. 요청 데이터 파싱
            String seatId = orderData.get("seatId").toString();
            String payment = orderData.get("payment").toString();
            String message = orderData.get("message").toString();
            Long totalPrice = Long.valueOf(orderData.get("totalPrice").toString());
            

            // ✅ 현금 관련 데이터 파싱
            String cashOption = null;
            Long cashAmount = null;
            
            if (orderData.containsKey("cash") && orderData.get("cash") != null) {
                cashOption = orderData.get("cash").toString();
            }
            
            if (orderData.containsKey("cashAmount") && orderData.get("cashAmount") != null) {
                cashAmount = Long.valueOf(orderData.get("cashAmount").toString());
            }

            // cartList 파싱
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> cartList = (List<Map<String, Object>>) orderData.get("cartList");
            
            // 상품 정보 추출
            List<Long> pNoList = cartList.stream()
                .map(cart -> Long.valueOf(cart.get("p_no").toString()))
                .collect(Collectors.toList());
            
            List<Long> quantityList = cartList.stream()
                .map(cart -> Long.valueOf(cart.get("quantity").toString()))
                .collect(Collectors.toList());
            
            List<String> pNameList = cartList.stream()
                .map(cart -> cart.get("p_name").toString())
                .collect(Collectors.toList());

            // ✅ 2. userNo 안전하게 변환
            Long userNo = cu.getUser().getNo();

            // ✅ 4. 주문 전 재고 체크
            for (int i = 0; i < pNoList.size(); i++) {
                Long pNo = pNoList.get(i);
                Long quantity = quantityList.get(i);
                String pName = pNameList.get(i);

                Long currentStock = productService.selectStockByPNo(pNo);
                if (currentStock == null || currentStock < quantity) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", pName + "의 재고가 부족합니다."));
                }
            }

            // ✅ 5. 주문 생성
            Orders order = new Orders();
            order.setUNo(userNo);
            order.setOrderStatus(0L);

            // ✅ 결제 방법에 따른 paymentStatus 설정
            if ("카드".equals(payment) || "카카오페이".equals(payment)) {
                order.setPaymentStatus(1L);  // 카드/카카오페이는 결제 완료
                order.setPayAt(LocalDateTime.now());
            } else {
                order.setPaymentStatus(0L);  // 현금도 미결제
            }

            order.setSeatId(seatId);
            order.setPayment(payment);
            order.setCashAmount(cashAmount);
            order.setMessage(message);
            order.setTotalPrice(totalPrice);
            

            boolean inserted = orderService.insertOrder(order);
            if (!inserted) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "주문 생성에 실패했습니다."));
            }
            
            Long oNo = order.getNo();

            // ✅ 6. 주문 상세 등록 및 재고 감소
            for (int i = 0; i < pNoList.size(); i++) {
                OrdersDetails detail = new OrdersDetails();
                detail.setONo(oNo);
                detail.setPNo(pNoList.get(i));
                detail.setQuantity(quantityList.get(i));
                orderService.insertOrderDetail(oNo, detail);
                
                // 상품 재고 감소
                productService.decreaseStock(pNoList.get(i), quantityList.get(i));
            }

            // ✅ 7. 장바구니 비우기
            cartService.deleteAllByUserNo(userNo);

            // ✅ 8. 로그 추가
            Users user = (Users) session.getAttribute("usageInfo");
            String username = (user != null) ? user.getUsername() : "알 수 없음";
            String description = username + "님이 " + order.getTotalPrice() + "원어치 상품을 주문하였습니다.";
            logService.insertLog(userNo, seatId, "상품 구매", description);
            
            // ✅ 수정된 성공 응답
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("orderNo", oNo);
            successResponse.put("cashOption", cashOption);  
            successResponse.put("cashAmount", cashAmount);  
            successResponse.put("message", "주문이 성공적으로 처리되었습니다.");

            return ResponseEntity.ok(successResponse);
            
        } catch (Exception e) {
            log.error("주문 처리 실패: ", e);
            
            // ✅ 에러 메시지 안전하게 처리
            String errorMessage = (e.getMessage() != null) ? e.getMessage() : "알 수 없는 오류";
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "주문 처리 중 오류가 발생했습니다: " + errorMessage
                ));
        }
    }
}
