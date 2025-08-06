package com.aloha.magicpos.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.service.OrderService;
import com.aloha.magicpos.service.ProductService;
import com.aloha.magicpos.service.UserService;

import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("users/orders")
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
    
    // 🔸 주문 등록
    @PostMapping("/create")
    public String insertOrder(
        Orders order, // 기본 주문 정보는 그대로 받고
        @RequestParam("seatId") String seatId,
        @RequestParam("pNoList") List<Long> pNoList,
        @RequestParam("quantityList") List<Long> quantityList,
        @RequestParam("pNameList") List<String> pNameList, // 상품 이름 리스트 추가
        RedirectAttributes rttr, // 리다이렉트 시 플래시 속성 사용
        HttpSession session // 세션에서 사용자 정보 가져오기
        ) throws Exception {
            // ✅ 1. 세션에서 userNo 안전하게 변환
            Object userNoObj = session.getAttribute("userNo");
            Long userNo = null;
            if (userNoObj instanceof Integer) {
                userNo = ((Integer) userNoObj).longValue();
            } else if (userNoObj instanceof Long) {
                userNo = (Long) userNoObj;
            } else if (userNoObj != null) {
                userNo = Long.valueOf(userNoObj.toString());
            }
            // ✅ 2. 세션에 없으면 임시 userNo로 설정
            if (userNo == null) {
                userNo = 1L; // 임시 유저 번호
                session.setAttribute("userNo", userNo);
            }
            // ✅ 3. 주문 전 재고 체크
            for (int i = 0; i < pNoList.size(); i++) {
                Long pNo = pNoList.get(i);
                Long quantity = quantityList.get(i);
                String pName = pNameList.get(i);

                // 이 메서드에서 재고 수량 조회
                Long currentStock = productService.selectStockByPNo(pNo);  // 아래에 구현 설명 있음

                if (currentStock == null || currentStock < quantity) {
                    rttr.addFlashAttribute("error", pName + "의 재고가 부족합니다.");
                    return "redirect:/menu";
                }
            }
            // 🔽 여기서 seatId 로그 확인
            log.debug("넘어온 seatId: {}", order.getSeatId());
            order.setUNo(userNo); // 주문에 사용자 번호 설정
            order.setOrderStatus(0L); // 기본 주문 상태 설정
            order.setPaymentStatus(0L); // 기본 결제 상태 설정
            order.setSeatId(seatId);
            boolean inserted = orderService.insertOrder(order);
            if (!inserted) return "redirect:/orders/fail";
            
            Long oNo = order.getNo(); // insert 후에 받아온 주문 번호

            // 상품별 주문 상세 넣기
            for (int i = 0; i < pNoList.size(); i++) {
                OrdersDetails detail = new OrdersDetails();
            detail.setONo(oNo);
            detail.setPNo(pNoList.get(i));
            detail.setQuantity(quantityList.get(i));
            orderService.insertOrderDetail(oNo, detail);
            // 상품 재고 감소
            productService.decreaseStock(pNoList.get(i), quantityList.get(i));
        }
        // 장바구니 비우기
        cartService.deleteAllByUserNo(userNo);

        // ✅ 로그 추가
        Users user = (Users) session.getAttribute("usageInfo");
        String username = (user != null) ? user.getUsername() : "알 수 없음";

        String description = username + "님이 " + order.getTotalPrice() + "원어치 상품을 주문하였습니다.";
        logService.insertLog(userNo, seatId, "상품 구매", description);
        
        rttr.addFlashAttribute("orderSuccess", true);
        return "redirect:/menu";
    }

    @PostMapping("/payment-info")
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
        // userNo 안전하게 변환
        Object userNoObj = params.get("userNo");
        Long userNo = null;
        if (userNoObj instanceof Integer) {
            userNo = ((Integer) userNoObj).longValue();
        } else if (userNoObj instanceof Long) {
            userNo = (Long) userNoObj;
        } else if (userNoObj != null) {
            userNo = Long.valueOf(userNoObj.toString());
        }
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
        result.put("successUrl", "http://" + ip + ":8080/users/payment/product/success");
        result.put("failUrl", "http://"+ ip + ":8080/users/payment/product/fail");

        return result;
    }

    }
