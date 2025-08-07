package com.aloha.magicpos.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.OrderService;
import com.aloha.magicpos.service.ProductService;

import org.springframework.web.servlet.mvc.support.RedirectAttributes;


import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/admin/orders")
public class AdminOrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;
    
    
    // 🔸 주문 삭제 (주문 + 상세 함께 삭제)
    @PostMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteOrder(@RequestParam("orderNo") Long orderNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 삭제 전에 해당 주문의 모든 상품 수량을 조회
            List<Map<String, Object>> details = orderService.findDetailsWithProductNames(orderNo);
            for (Map<String, Object> detail : details) {
                Long pNo = ((Number) detail.get("p_no")).longValue();
                Long quantity = ((Number) detail.get("quantity")).longValue();
                productService.increaseStock(pNo, quantity);
            }
            orderService.deleteOrder(orderNo);
            result.put("success", true);
            result.put("message", "주문이 삭제되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
    
    // 🔸 주문 상세 삭제 (단일 상품)
    @PostMapping("/delete/detail")
    public ResponseEntity<Map<String, Object>> deleteOrderDetail(@RequestParam("oNo") Long oNo, @RequestParam("pNo") Long pNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            Long quantity = orderService.getQuantityByOrderAndProduct(oNo, pNo);
            orderService.deleteOrderDetail(oNo, pNo);
            productService.increaseStock(pNo, quantity);
            Orders order = orderService.findOrderByNo(oNo);
            if (order == null) {
                result.put("success", true);
                result.put("message", "주문이 삭제되었습니다.");
            } else {
                result.put("success", true);
                result.put("message", "주문 상세가 삭제되었습니다.");
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
    // 🔸 주문 상세 1 수량 증가
    @PostMapping("/increaseQuantity")
    public ResponseEntity<Map<String, Object>> increaseOrderDetailQuantity(@RequestParam("oNo") Long orderNo,
                                               @RequestParam("pNo") Long productNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            orderService.increaseQuantity(orderNo, productNo);
            productService.decreaseStock(productNo, 1L);
            result.put("success", true);
            result.put("message", "수량이 증가되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
    
    // 🔸 주문 상세 1 수량 감소
    @PostMapping("/decreaseQuantity")
    public ResponseEntity<Map<String, Object>> decreaseOrderDetailQuantity(@RequestParam("oNo") Long orderNo,
    @RequestParam("pNo") Long productNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            orderService.decreaseQuantity(orderNo, productNo);
            productService.increaseStock(productNo, 1L);
            result.put("success", true);
            result.put("message", "수량이 감소되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
    
    // 🔸 주문 상세 수량 수정
    @PostMapping("/updateQuantity")
    public ResponseEntity<Map<String, Object>> updateOrderDetailQuantity(@RequestParam Long orderNo,
                                            @RequestParam Long productNo,
                                            @RequestParam Long quantity) {
        Map<String, Object> result = new HashMap<>();
        try {
            orderService.updateOrderDetailQuantity(orderNo, productNo, quantity);
            result.put("success", true);
            result.put("message", "수량이 수정되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    // 🔸 주문 상세 등록
    @PostMapping("/{oNo}/details")
    public ResponseEntity<Map<String, Object>> insertOrderDetail(@PathVariable Long oNo, @RequestBody OrdersDetails detail) {
        Map<String, Object> result = new HashMap<>();
        try {
            orderService.insertOrderDetail(oNo, detail);
            result.put("success", true);
            result.put("message", "주문 상세가 등록되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    // 🔸 주문 상태/결제 상태 수정
    @PutMapping("/{no}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long no,
                               @RequestParam Long orderStatus,
                               @RequestParam Long paymentStatus) {
        Map<String, Object> result = new HashMap<>();
        try {
            orderService.updateStatus(no, orderStatus, paymentStatus);
            result.put("success", true);
            result.put("message", "주문 상태가 수정되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }


    // 🔸 모든 주문 조회
    @GetMapping
    public ResponseEntity<?> findAllOrders() {
        try {
            List<Orders> orders = orderService.findAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 🔸 특정 사용자 주문 목록 조회(사용자페이지 사용)
    @GetMapping("/user")
    public ResponseEntity<?> findOrdersByUser(@PathVariable Long uNo) {
        try {
            List<Orders> orders = orderService.findOrdersByUser(uNo);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 🔸 단일 주문 조회
    @GetMapping("/{no}")
    public ResponseEntity<?> findOrderByNo(@PathVariable Long no) {
        try {
            Orders order = orderService.findOrderByNo(no);
            if (order == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body("주문이 존재하지 않습니다.");
            }
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 🔸 주문 상세 목록 조회 (단순)
    @GetMapping("/{oNo}/details")
    public ResponseEntity<?> findOrderDetails(@PathVariable Long oNo) {
        try {
            List<OrdersDetails> details = orderService.findOrderDetails(oNo);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 🔸 주문 상세 목록 조회 (상품명 + 가격 포함)
    @GetMapping("/{oNo}/details/products")
    public ResponseEntity<?> findDetailsWithProductNames(@PathVariable Long oNo) {
        try {
            List<Map<String, Object>> details = orderService.findDetailsWithProductNames(oNo);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }




    // 주문 상태 변경
    @PutMapping("/{no}/status/update")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(@PathVariable Long no,
                                    @RequestParam Long orderStatus,
                                    @RequestParam Long paymentStatus) {
        Map<String, Object> result = new HashMap<>();
        try {
            orderService.updateStatus(no, orderStatus, paymentStatus);
            result.put("success", true);
            result.put("message", "주문 상태가 변경되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    // 주문 상태 변경(AJAX)
    @PostMapping("/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatusAjax(@RequestParam Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            Long no = Long.parseLong(params.get("no"));
            Long orderStatus = Long.parseLong(params.get("orderStatus"));
            log.info("🔥 상태 변경 요청: no={}, status={}", no, orderStatus);
            Orders order = orderService.findOrderByNo(no);
            if (order == null) {
                log.warn("❗ 주문 없음: no={}", no);
                result.put("success", false);
                result.put("message", "주문이 존재하지 않습니다.");
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(result);
            }
            Long paymentStatus = order.getPaymentStatus();
            if (paymentStatus == null) {
                log.warn("❗ 결제 상태 없음: orderNo={}", no);
                result.put("success", false);
                result.put("message", "결제 상태가 존재하지 않습니다.");
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(result);
            }
            orderService.updateStatusWithPayAt(no, orderStatus, paymentStatus);
            result.put("success", true);
            result.put("message", "주문 상태가 변경되었습니다.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❗ 상태 변경 중 오류 발생", e);
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    // 주문 상태 카운트 조회 (AJAX)
    @GetMapping("/status/counts")
    public ResponseEntity<?> getOrderCounts() {
        try {
            Map<String, Long> counts = new HashMap<>();
            counts.put("orderCount", orderService.countByStatus(List.of(0L, 1L)));
            counts.put("prepareCount", orderService.countByStatus(List.of(1L)));
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/cart/json")
    public ResponseEntity<?> getCartList(HttpSession session) {
        try {
            Object userNoObj = session.getAttribute("userNo");
            Long userNo = null;
            if (userNoObj instanceof Integer) {
                userNo = ((Integer) userNoObj).longValue();
            } else if (userNoObj instanceof Long) {
                userNo = (Long) userNoObj;
            } else if (userNoObj != null) {
                userNo = Long.valueOf(userNoObj.toString());
            }
            List<Map<String, Object>> cart = cartService.findCartWithProductByUser(userNo);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}