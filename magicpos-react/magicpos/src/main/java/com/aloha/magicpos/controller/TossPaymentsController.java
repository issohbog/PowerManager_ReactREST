package com.aloha.magicpos.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.view.RedirectView;

import com.aloha.magicpos.domain.UserTickets;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.UserTicketService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.service.OrderService;
import com.aloha.magicpos.service.ProductService;
import com.aloha.magicpos.service.TicketService;
import com.aloha.magicpos.service.UserService;
import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.domain.Tickets;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class TossPaymentsController {
    
    @Autowired
    private UserTicketService userTicketService;
    
    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ProductService productService;

    @Autowired
    private LogService logService;

    @Autowired
    private UserService userService;

    
    // ===== 요금제 결제 (Tickets) =====
    
    // 관리자 요금제 결제 성공
    @GetMapping("/admin/payment/ticket/success")
    public RedirectView adminTicketPaymentSuccess
                                         (@RequestParam("paymentKey") String paymentKey,
                                          @RequestParam("orderId") String orderId,
                                          @RequestParam("amount") int amount, 
                                          @RequestParam("currentPage") String currentPage,
                                          HttpServletRequest request
                                          ) throws Exception {

        log.info("💳 관리자 요금제 결제 성공: paymentKey={}, orderId={}, amount={}, currentPage={}", paymentKey, orderId, amount, currentPage);
        // Map<String, Object> result = new HashMap<>();

        log.info("#############################################################");
        log.info("client ip : {}", request.getRemoteAddr());
        log.info("server ip : {}", InetAddress.getLocalHost().getHostAddress());
        InetAddress inetAddress = InetAddress.getLocalHost();
        String ip = inetAddress.getHostAddress();
        log.info("#############################################################");

        try {
            // 주문 정보에서 요금제 구매 정보 추출
            String[] orderParts = orderId.split("_");
            if (orderParts.length >= 3 && orderParts[0].equals("admin") && orderParts[1].equals("ticket")) {
                try {
                    // orderId 예시: admin_ticket_1752646983802_user_2_ticket_3
                    String[] idParts = orderId.split("_");
                    if (idParts.length >= 7 && idParts[3].equals("user") && idParts[5].equals("ticket")) {
                        try {
                            Long userNo = Long.parseLong(idParts[4]);
                            Long ticketNo = Long.parseLong(idParts[6]);

                            // UserTickets 객체 생성 및 insertUserTicketByAdmin 사용
                            UserTickets userTicket = new UserTickets();
                            userTicket.setUNo(userNo);
                            userTicket.setTNo(ticketNo);
                            userTicket.setPayAt(new java.sql.Timestamp(System.currentTimeMillis()));
                            userTicket.setPayment("CARD"); // 결제 방법 설정
                            
                            // insertUserTicketByAdmin 사용 (티켓 정보 자동 조회 및 남은 시간 설정)
                            boolean insertSuccess = userTicketService.insertUserTicketByAdmin(userTicket);
                            if (insertSuccess) {
                                log.info("💳 관리자 요금제 구매 완료: userNo={}, ticketNo={}, amount={}", userNo, ticketNo, amount);
                                // result.put("message", "관리자 요금제 결제가 성공적으로 완료되었습니다.");
                                // result.put("success", true);
                            } else {
                                log.error("💳 관리자 요금제 구매 저장 실패: userNo={}, ticketNo={}", userNo, ticketNo);
                                // result.put("success", false);
                                // result.put("message", "관리자 요금제 결제 저장에 실패했습니다.");
                            }
                        } catch (Exception e) {
                            log.error("💳 userNo/ticketNo 파싱 오류: {}", e.getMessage(), e);
                        }
                    } else {
                        log.error("💳 orderId 형식 오류(파싱 실패): {}", orderId);
                    }
                } catch (Exception e) {
                    log.error("💳 관리자 요금제 구매 처리 중 오류: {}", e.getMessage(), e);
                }
            }
            
            // result.put("paymentKey", paymentKey);
            // result.put("orderId", orderId);
            // result.put("amount", amount);
            // return ResponseEntity.ok(result);
            return new RedirectView("http://" + ip + ":5173/admin/" + currentPage + "?payment=success");
            // return new RedirectView("http://localhost:5173/admin/" + currentPage + "?payment=success");

        } catch (Exception e) {
            log.error("💳 관리자 요금제 결제 승인 처리 중 오류: {}", e.getMessage(), e);
            return new RedirectView("http://" + ip + ":5173/admin/" + currentPage + "/payment=fail");
            // return new RedirectView("http://localhost:5173/admin/" + currentPage + "/payment=fail");

        }

    }
    
    // 관리자 요금제 결제 실패
    @GetMapping("/admin/payment/ticket/fail")
    public ResponseEntity<Map<String, Object>> adminTicketPaymentFail(@RequestParam(value = "message", required = false) String message,
                                       @RequestParam(value = "code", required = false) String code
                                       ) {
        log.info("💳 관리자 요금제 결제 실패: message={}, code={}", message, code);
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", message != null ? message : "관리자 요금제 결제에 실패했습니다.");
        result.put("code", code);
        return ResponseEntity.ok(result);
    }
    
    // 사용자 요금제 결제 성공
    @GetMapping("/users/payment/ticket/success")
    public RedirectView userTicketPaymentSuccess(
                                         @RequestParam("paymentKey") String paymentKey,
                                         @RequestParam("orderId") String orderId,
                                         @RequestParam("amount") int amount,
                                         @RequestParam("userNo") Long userNo,
                                         @RequestParam("ticketNo") Long ticketNo
                                         ) throws Exception {
        log.info("💳 사용자 요금제 결제 성공: paymentKey={}, orderId={}, amount={}, userNo={}, ticketNo={}", paymentKey, orderId, amount, userNo, ticketNo);
        
        InetAddress inetAddress = InetAddress.getLocalHost();
        String ip = inetAddress.getHostAddress();

        // 사용자 요금제 결제 처리 로직
        UserTickets userTicket = new UserTickets();
        userTicket.setUNo(userNo);
        userTicket.setTNo(ticketNo);
        userTicket.setPayment("CARD");
        userTicket.setPayAt(new java.sql.Timestamp(System.currentTimeMillis()));

        // boolean success = userTicketService.insertUserTicketByAdmin(userTicket);
        userTicketService.insertUserTicketByAdmin(userTicket);
        // Map<String, Object> result = new HashMap<>();
        // result.put("success", success);
        // result.put("message", "사용자 요금제 결제가 성공적으로 완료되었습니다.");
        // result.put("paymentKey", paymentKey);
        // result.put("orderId", orderId);
        // result.put("amount", amount);
        // result.put("userNo", userNo);
        // result.put("ticketNo", ticketNo);
        
        // return ResponseEntity.ok(result);


        return new RedirectView("http://" + ip + ":5173/menu?ticketPayment=success");
        // return new RedirectView("http://localhost:5173/menu?ticketPayment=success");
    }
    
    // 사용자 요금제 결제 실패
    @GetMapping("/users/payment/ticket/fail")
    public ResponseEntity<Map<String, Object>> userTicketPaymentFail(@RequestParam(value = "message", required = false) String message,
                                      @RequestParam(value = "code", required = false) String code
                                      
                            ) {
        log.info("💳 사용자 요금제 결제 실패: message={}, code={}", message, code);
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", message != null ? message : "사용자 요금제 결제에 실패했습니다.");    
        result.put("code", code);
        return ResponseEntity.ok(result);
    }

    
    // ===== 상품 결제 (Products) =====
    
    // 결제 정보 생성 API
    @PostMapping("/users/orders/payment-info")
    public ResponseEntity<Map<String, Object>> getPaymentInfo(
            @RequestBody Map<String, Object> orderData,
            HttpSession session) {
        
        try {
            String orderId = "ORDER_" + System.currentTimeMillis();
            
            // ✅ cartList에서 상품명 추출
            String orderName = "PC방 주문"; // 기본값

            InetAddress inetAddress = InetAddress.getLocalHost();
            String ip = inetAddress.getHostAddress();
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> cartList = (List<Map<String, Object>>) orderData.get("cartList");
            
            if (cartList != null && !cartList.isEmpty()) {
                String firstProductName = cartList.get(0).get("p_name").toString();
                if (cartList.size() == 1) {
                    orderName = firstProductName;
                } else {
                    orderName = firstProductName + " 외 " + (cartList.size() - 1) + "개";
                }
            }
            Map<String, Object> paymentInfo = new HashMap<>();
            paymentInfo.put("amount", orderData.get("totalPrice"));
            paymentInfo.put("orderId", orderId);
            paymentInfo.put("orderName", orderName);
            paymentInfo.put("customerName", orderData.get("customerName"));
            paymentInfo.put("successUrl",  "http://" + ip + ":5173/menu?payment=success");
            paymentInfo.put("failUrl", "http://" + ip + ":5173/menu?payment=fail");

            // 세션에 주문 정보 임시 저장
            session.setAttribute("tempOrder_" + orderId, orderData);
            
            return ResponseEntity.ok(paymentInfo);
            
        } catch (Exception e) {
            log.error("결제 정보 생성 실패: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "결제 정보 생성에 실패했습니다."));
        }
    }

    // 결제 성공 확인 API
    @PostMapping("/users/orders/success")
    public ResponseEntity<Map<String, Object>> confirmPayment(
            @RequestBody Map<String, Object> paymentData,
            @AuthenticationPrincipal CustomUser cu,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        try {
            String paymentKey = (String) paymentData.get("paymentKey");
            String orderId = (String) paymentData.get("orderId");
            Integer amount = Integer.valueOf(paymentData.get("amount").toString());

            Long userNo = cu.getUser().getNo();
            String username = cu.getUser().getUsername();
            String seatId = (String) paymentData.get("seatId");
            String payment = (String) paymentData.get("payment");

            Orders order = new Orders();
            order.setUNo(userNo);
            order.setSeatId(seatId);
            order.setTotalPrice(amount.longValue());
            order.setOrderStatus(0L);
            order.setPaymentStatus(1L);
            order.setPayment(payment);
            order.setPayAt(LocalDateTime.now());
            orderService.insertOrder(order);
            Long oNo = order.getNo();

            // cartList 기반 주문 상세 생성
            List<Map<String, Object>> cartList = (List<Map<String, Object>>) paymentData.get("cartList");
            if (cartList != null && !cartList.isEmpty()) {
                for (Map<String, Object> item : cartList) {
                    Long pNo = Long.valueOf(item.get("p_no").toString());
                    Long quantity = Long.valueOf(item.get("quantity").toString());

                    OrdersDetails detail = new OrdersDetails();
                    detail.setONo(oNo);
                    detail.setPNo(pNo);
                    detail.setQuantity(quantity);
                    orderService.insertOrderDetail(oNo, detail);
                    productService.decreaseStock(pNo, quantity);
                }
            } else {
                // 기존 방식도 예외적으로 지원
                List<Object> pNoObjs = (List<Object>) paymentData.get("pNoList");
                List<Integer> pNos = pNoObjs != null ? pNoObjs.stream()
                    .map(obj -> Integer.parseInt(obj.toString()))
                    .collect(Collectors.toList()) : List.of();

                List<Object> quantityObjs = (List<Object>) paymentData.get("quantityList");
                List<Integer> quantities = quantityObjs != null ? quantityObjs.stream()
                    .map(obj -> Integer.parseInt(obj.toString()))
                    .collect(Collectors.toList()) : List.of();

                for (int i = 0; i < pNos.size(); i++) {
                    OrdersDetails detail = new OrdersDetails();
                    detail.setONo(oNo);
                    detail.setPNo(Long.valueOf(pNos.get(i)));
                    detail.setQuantity(Long.valueOf(quantities.get(i)));
                    orderService.insertOrderDetail(oNo, detail);
                    productService.decreaseStock(Long.valueOf(pNos.get(i)), Long.valueOf(quantities.get(i)));
                }
            }

            cartService.deleteAllByUserNo(userNo);

            String description = username + "님이 " + amount + "원어치 상품을 결제했습니다.";
            logService.insertLog(userNo, seatId, "상품 구매", description);

            session.removeAttribute("tempOrder_" + orderId);

            result.put("success", true);
            result.put("message", "결제가 완료되었습니다.");
            result.put("paymentKey", paymentKey);
            result.put("orderId", orderId);
            result.put("amount", amount);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("결제 확인 실패: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "결제 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }

    // 🔸 관리자 상품 구매 (TossPayments 연동용)
    @PostMapping("/admin/sellcounter/payment-info")
    @ResponseBody
    public Map<String, Object> getProductOrderPaymentInfo(@RequestBody Map<String, Object> params, HttpServletRequest request) throws UnknownHostException {
        log.info("#############################################################");
        log.info("client ip : {}", request.getRemoteAddr());
        log.info("server ip : {}", InetAddress.getLocalHost().getHostAddress());
        InetAddress inetAddress = InetAddress.getLocalHost();
        String ip = inetAddress.getHostAddress();

        
        log.info("#############################################################");
        
        
        String seatId = params.get("seatId").toString();
        int totalPrice = Integer.parseInt(params.get("totalPrice").toString());
        String payment = params.get("payment").toString();
        Long userNo = Long.valueOf(params.get("userNo").toString());
        Users user = userService.findByNo(userNo);  
        String customerName = user.getUsername();  

        // 상품명 최대 2개만 보여줌
        List<String> productNames = ((List<?>) params.get("pNameList")).stream()
                                                        .map(Object::toString)
                                                        .collect(Collectors.toList());
        String orderName = productNames.stream().limit(2).collect(Collectors.joining(", ")) + (productNames.size() > 2 ? " 외" : "");

        String orderId = "order-" + System.currentTimeMillis() + "_seat" + seatId;

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("orderName", orderName);
        result.put("amount", totalPrice);
        result.put("customerName", customerName); // 또는 로그인 유저 이름 등
        result.put("successUrl",  "http://" + ip + ":5173/admin?payment=success");
        result.put("failUrl", "http://" + ip + ":5173/admin?payment=fail");

        return result;
    }

    // 관리자 상품 결제 성공 - RestController로 변경
    @PostMapping("/admin/payment/product/success")
    public ResponseEntity<Map<String, Object>> adminProductPaymentSuccess(
            @RequestBody Map<String, Object> paymentData,
            HttpSession session, @AuthenticationPrincipal CustomUser cu) {

        String paymentKey = (String) paymentData.get("paymentKey");
        String orderId = (String) paymentData.get("orderId");
        int amount = Integer.parseInt(paymentData.get("amount").toString());

        Map<String, Object> result = new HashMap<>();
        try {
            log.info("💳 관리자 상품 결제 성공: paymentKey={}, orderId={}, amount={}", paymentKey, orderId, amount);

            // ✅ 1. 세션에서 임시 주문 정보 꺼냄
            Map<String, Object> temp = (Map<String, Object>) session.getAttribute("tempOrder");
            if (temp == null) {
                result.put("success", false);
                result.put("message", "주문 정보가 유실되었습니다.");
                return ResponseEntity.badRequest().body(result);
            }

            // ✅ 2. 주문 기본 정보
            String seatId = temp.get("seatId").toString();

            // ✅ 2. userNo 안전하게 변환
            Long userNo = cu.getUser().getNo();

            // 3.username 안전하게 변환
            String username = cu.getUser().getUsername();
            String payment = (String) temp.get("payment");
            
            // ✅ 3. 주문 insert
            Orders order = new Orders();
            order.setUNo(userNo);
            order.setSeatId(seatId);
            order.setTotalPrice((long) amount);
            order.setOrderStatus(0L);
            order.setPaymentStatus(1L); // 카드 결제 성공
            order.setPayment(payment);
            order.setPayAt(LocalDateTime.now());
            orderService.insertOrder(order);
            Long oNo = order.getNo();

            // 주문 상세 생성 부분을 아래처럼 수정하세요
            List<Map<String, Object>> cartList = (List<Map<String, Object>>) paymentData.get("cartList");
            if (cartList != null && !cartList.isEmpty()) {
                for (Map<String, Object> item : cartList) {
                    Long pNo = Long.valueOf(item.get("p_no").toString());
                    Long quantity = Long.valueOf(item.get("quantity").toString());

                    OrdersDetails detail = new OrdersDetails();
                    detail.setONo(oNo);
                    detail.setPNo(pNo);
                    detail.setQuantity(quantity);
                    orderService.insertOrderDetail(oNo, detail);
                    productService.decreaseStock(pNo, quantity);
                }
            } else {
                // 기존 pNoList, quantityList 방식도 지원
                List<Object> pNoObjs = (List<Object>) temp.get("pNoList");
                List<Integer> pNos = pNoObjs.stream()
                        .map(obj -> Integer.parseInt(obj.toString()))
                        .collect(Collectors.toList());

                List<Object> quantityObjs = (List<Object>) temp.get("quantityList");
                List<Integer> quantities = quantityObjs.stream()
                        .map(obj -> Integer.parseInt(obj.toString()))
                        .collect(Collectors.toList());

                for (int i = 0; i < pNos.size(); i++) {
                    OrdersDetails detail = new OrdersDetails();
                    detail.setONo(oNo);
                    detail.setPNo(Long.valueOf(pNos.get(i)));
                    detail.setQuantity(Long.valueOf(quantities.get(i)));
                    orderService.insertOrderDetail(oNo, detail);
                    productService.decreaseStock(Long.valueOf(pNos.get(i)), Long.valueOf(quantities.get(i)));
                }
            }

            // 장바구니 비우기
            cartService.deleteAllByUserNo(userNo);

            // ✅ 5. 로그 남기기
            String desc = username + "님이 " + amount + "원어치 상품을 결제했습니다.";
            logService.insertLog(userNo, seatId, "상품 구매", desc);

            // ✅ 6. 세션에서 temp 제거
            session.removeAttribute("tempOrder");

            result.put("success", true);
            result.put("message", "관리자 상품 결제가 완료되었습니다.");
            result.put("paymentKey", paymentKey);
            result.put("orderId", orderId);
            result.put("amount", amount);

            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("관리자 상품 결제 처리 실패: {}", e.getMessage());
            result.put("success", false);
            result.put("message", "결제 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }

    // 관리자 상품 결제 실패 - RestController로 변경
    @GetMapping("/admin/payment/product/fail")
    public ResponseEntity<Map<String, Object>> adminProductPaymentFail(
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "code", required = false) String code) {
        
        log.info("💳 관리자 상품 결제 실패: message={}, code={}", message, code);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", message != null ? message : "관리자 상품 결제에 실패했습니다.");
        result.put("code", code);
        
        return ResponseEntity.ok(result);
    }

    // 사용자 상품 결제 실패 - 수정
    @GetMapping("/users/payment/product/fail")
    public ResponseEntity<Map<String, Object>> userProductPaymentFail(
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "code", required = false) String code) {
    
        log.info("💳 사용자 상품 결제 실패: message={}, code={}", message, code);
    
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", message != null ? message : "사용자 상품 결제에 실패했습니다.");
        result.put("code", code);
    
        return ResponseEntity.ok(result);
    }

}