package com.aloha.magicpos.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.aloha.magicpos.domain.UserTickets;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.UserTicketService;

import jakarta.servlet.http.HttpSession;

import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.service.OrderService;
import com.aloha.magicpos.service.ProductService;
import com.aloha.magicpos.service.TicketService;
import com.aloha.magicpos.service.UserService;
import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.domain.Tickets;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
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

    
    // ===== 요금제 결제 (Tickets) =====
    
    // 관리자 요금제 결제 성공
    @GetMapping("/admin/payment/ticket/success")
    public String adminTicketPaymentSuccess(@RequestParam("paymentKey") String paymentKey,
                                          @RequestParam("orderId") String orderId,
                                          @RequestParam("amount") int amount,
                                          Model model) throws Exception {
        log.info("💳 관리자 요금제 결제 성공: paymentKey={}, orderId={}, amount={}", paymentKey, orderId, amount);
        
        try {
            // 주문 정보에서 요금제 구매 정보 추출
            String[] orderParts = orderId.split("_");
            if (orderParts.length >= 3 && orderParts[0].equals("admin") && orderParts[1].equals("ticket")) {
                try {
                    // orderId 예시: admin_ticket_1752646983802_user2_ticket3
                    String[] idParts = orderId.split("_");
                    if (idParts.length >= 5 && idParts[3].startsWith("user") && idParts[4].startsWith("ticket")) {
                        try {
                            Long userNo = Long.parseLong(idParts[3].replace("user", ""));
                            Long ticketNo = Long.parseLong(idParts[4].replace("ticket", ""));
                            
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
                            } else {
                                log.error("💳 관리자 요금제 구매 저장 실패: userNo={}, ticketNo={}", userNo, ticketNo);
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
            
            model.addAttribute("message", "관리자 요금제 결제가 성공적으로 완료되었습니다.");
            model.addAttribute("orderId", orderId);
            model.addAttribute("amount", amount);
            model.addAttribute("paymentKey", paymentKey);
            return "payment/success";
        } catch (Exception e) {
            log.error("💳 관리자 요금제 결제 승인 처리 중 오류: {}", e.getMessage());
            model.addAttribute("message", "관리자 요금제 결제 승인 처리 중 오류가 발생했습니다.");
            return "payment/fail";
        }
    }
    
    // 관리자 요금제 결제 실패
    @GetMapping("/admin/payment/ticket/fail")
    public String adminTicketPaymentFail(@RequestParam(value = "message", required = false) String message,
                                       @RequestParam(value = "code", required = false) String code,
                                       Model model) {
        log.info("💳 관리자 요금제 결제 실패: message={}, code={}", message, code);
        
        model.addAttribute("message", message != null ? message : "관리자 요금제 결제에 실패했습니다.");
        model.addAttribute("code", code);
        return "payment/fail";
    }
    
    // 사용자 요금제 결제 성공
    @GetMapping("/users/payment/ticket/success")
    public String userTicketPaymentSuccess(@RequestParam("paymentKey") String paymentKey,
                                         @RequestParam("orderId") String orderId,
                                         @RequestParam("amount") int amount,
                                         @RequestParam("userNo") Long userNo,
                                         @RequestParam("ticketNo") Long ticketNo,
                                         Model model) throws Exception {
        log.info("💳 사용자 요금제 결제 성공: paymentKey={}, orderId={}, amount={}, userNo={}, ticketNo={}", paymentKey, orderId, amount, userNo, ticketNo);
        
        // 사용자 요금제 결제 처리 로직
        UserTickets userTicket = new UserTickets();
        userTicket.setUNo(userNo);
        userTicket.setTNo(ticketNo);
        userTicket.setPayment("CARD");
        userTicket.setPayAt(new java.sql.Timestamp(System.currentTimeMillis()));

        boolean success = userTicketService.insertUserTicketByAdmin(userTicket);

        if (success) {
            // 결제 완료 후 menu로 리다이렉트(모달 자동 오픈)
            return "redirect:/menu?payment=success";
        } else {
            model.addAttribute("message", "티켓 지급에 실패했습니다.");
            return "payment/fail";
        }
    }
    
    // 사용자 요금제 결제 실패
    @GetMapping("/users/payment/ticket/fail")
    public String userTicketPaymentFail(@RequestParam(value = "message", required = false) String message,
                                      @RequestParam(value = "code", required = false) String code,
                                      Model model) {
        log.info("💳 사용자 요금제 결제 실패: message={}, code={}", message, code);
        
        model.addAttribute("message", message != null ? message : "사용자 요금제 결제에 실패했습니다.");
        model.addAttribute("code", code);
        return "payment/fail";
    }
    
    // ===== 상품 결제 (Products) =====
    
    // 관리자 상품 결제 성공
    @GetMapping("/admin/payment/product/success")
    public String adminProductPaymentSuccess(@RequestParam("paymentKey") String paymentKey,
    @RequestParam("orderId") String orderId,
    @RequestParam("amount") int amount,
    HttpSession session,
    RedirectAttributes rttr) throws Exception {

    log.info("💳 사용자 상품 결제 성공: paymentKey={}, orderId={}, amount={}", paymentKey, orderId, amount);

    // ✅ 1. 세션에서 임시 주문 정보 꺼냄
    Map<String, Object> temp = (Map<String, Object>) session.getAttribute("tempOrder");
    if (temp == null) {
    rttr.addFlashAttribute("error", "주문 정보가 유실되었습니다.");
    return "redirect:/admin";
    }

    // ✅ 2. 주문 기본 정보
    String seatId = temp.get("seatId").toString();

    Object userNoObj = session.getAttribute("userNo");

    Long userNo = null;
    if (userNoObj instanceof Integer) {
    userNo = ((Integer) userNoObj).longValue();
    } else if (userNoObj instanceof Long) {
    userNo = (Long) userNoObj;
    } else if (userNoObj != null) {
    userNo = Long.valueOf(userNoObj.toString());
    }
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

    // ✅ 4. 상세정보 insert + 재고 감소
    List<Object> pNoObjs = (List<Object>) temp.get("pNoList");
    List<Integer> pNos = pNoObjs.stream()
    .map(obj -> Integer.parseInt(obj.toString()))
    .collect(Collectors.toList());

    List<Object> quantityObjs = (List<Object>) temp.get("quantityList");
    List<Integer> quantities = quantityObjs.stream()
        .map(obj -> Integer.parseInt(obj.toString()))
        .collect(Collectors.toList());

    List<String> pNames = (List<String>) temp.get("pNameList");

    for (int i = 0; i < pNos.size(); i++) {
    OrdersDetails detail = new OrdersDetails();
    detail.setONo(oNo);
    detail.setPNo(Long.valueOf(pNos.get(i)));
    detail.setQuantity(Long.valueOf(quantities.get(i)));
    orderService.insertOrderDetail(oNo, detail);
    productService.decreaseStock(Long.valueOf(pNos.get(i)), Long.valueOf(quantities.get(i)));
    }

    // 장바구니 비우기
    cartService.deleteAllByUserNo(userNo);


    // ✅ 5. 로그 남기기
    Users user = (Users) session.getAttribute("usageInfo");
    String username = (user != null) ? user.getUsername() : "알 수 없음";
    String desc = username + "님이 " + amount + "원어치 상품을 결제했습니다.";
    logService.insertLog(userNo, seatId, "상품 구매", desc);

    // ✅ 6. 세션에서 temp 제거
    session.removeAttribute("tempOrder");

    // ✅ 7. 주문 완료 모달 뜨게 redirect
    return "redirect:/admin";
}
    

    
    // 관리자 상품 결제 실패
    @GetMapping("/admin/payment/product/fail")
    public String adminProductPaymentFail(@RequestParam(value = "message", required = false) String message,
                                        @RequestParam(value = "code", required = false) String code,
                                        Model model) {
        log.info("💳 관리자 상품 결제 실패: message={}, code={}", message, code);
        
        model.addAttribute("message", message != null ? message : "관리자 상품 결제에 실패했습니다.");
        model.addAttribute("code", code);
        return "payment/fail";
    }
    
    // 사용자 상품 결제 성공
    @GetMapping("/users/payment/product/success")
    public String userProductPaymentSuccess(@RequestParam("paymentKey") String paymentKey,
                                            @RequestParam("orderId") String orderId,
                                            @RequestParam("amount") int amount,
                                            HttpSession session,
                                            RedirectAttributes rttr) throws Exception {

        log.info("💳 사용자 상품 결제 성공: paymentKey={}, orderId={}, amount={}", paymentKey, orderId, amount);

        // ✅ 1. 세션에서 임시 주문 정보 꺼냄
        Map<String, Object> temp = (Map<String, Object>) session.getAttribute("tempOrder");
        if (temp == null) {
            rttr.addFlashAttribute("error", "주문 정보가 유실되었습니다.");
            return "redirect:/menu";
        }

        // ✅ 2. 주문 기본 정보
        String seatId = temp.get("seatId").toString();

        Object userNoObj = session.getAttribute("userNo");

        Long userNo = null;
        if (userNoObj instanceof Integer) {
            userNo = ((Integer) userNoObj).longValue();
        } else if (userNoObj instanceof Long) {
            userNo = (Long) userNoObj;
        } else if (userNoObj != null) {
            userNo = Long.valueOf(userNoObj.toString());
        }
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

        // ✅ 4. 상세정보 insert + 재고 감소
        List<Object> pNoObjs = (List<Object>) temp.get("pNoList");
        List<Integer> pNos = pNoObjs.stream()
                                    .map(obj -> Integer.parseInt(obj.toString()))
                                    .collect(Collectors.toList());

        List<Object> quantityObjs = (List<Object>) temp.get("quantityList");
        List<Integer> quantities = quantityObjs.stream()
                                            .map(obj -> Integer.parseInt(obj.toString()))
                                            .collect(Collectors.toList());

        List<String> pNames = (List<String>) temp.get("pNameList");

        for (int i = 0; i < pNos.size(); i++) {
            OrdersDetails detail = new OrdersDetails();
            detail.setONo(oNo);
            detail.setPNo(Long.valueOf(pNos.get(i)));
            detail.setQuantity(Long.valueOf(quantities.get(i)));
            orderService.insertOrderDetail(oNo, detail);
            productService.decreaseStock(Long.valueOf(pNos.get(i)), Long.valueOf(quantities.get(i)));
        }

        // 장바구니 비우기
        cartService.deleteAllByUserNo(userNo);
        

        // ✅ 5. 로그 남기기
        Users user = (Users) session.getAttribute("usageInfo");
        String username = (user != null) ? user.getUsername() : "알 수 없음";
        String desc = username + "님이 " + amount + "원어치 상품을 결제했습니다.";
        logService.insertLog(userNo, seatId, "상품 구매", desc);

        // ✅ 6. 세션에서 temp 제거
        session.removeAttribute("tempOrder");

        // ✅ 7. 주문 완료 모달 뜨게 redirect
        return "redirect:/menu?orderSuccess=true";
    }

    
    // 사용자 상품 결제 실패
    @GetMapping("/users/payment/product/fail")
    public String userProductPaymentFail(@RequestParam(value = "message", required = false) String message,
                                       @RequestParam(value = "code", required = false) String code,
                                       Model model) {
        log.info("💳 사용자 상품 결제 실패: message={}, code={}", message, code);
        
        model.addAttribute("message", message != null ? message : "사용자 상품 결제에 실패했습니다.");
        model.addAttribute("code", code);
        return "payment/fail";
    }
} 