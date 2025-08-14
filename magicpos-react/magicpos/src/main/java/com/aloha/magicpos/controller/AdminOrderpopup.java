package com.aloha.magicpos.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.Carts;
import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.OrderService;
import com.aloha.magicpos.service.ProductService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
@RestController
public class AdminOrderpopup {
    
    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;


    // ✅ 장바구니에 항목 추가
    @PostMapping("/admin/sellcounter/add")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Carts carts, HttpSession session) {
        try {
            Object userNoObj = session.getAttribute("userNo");
            Long uNo = null;
            if (userNoObj instanceof Integer) {
                uNo = ((Integer) userNoObj).longValue();
            } else if (userNoObj instanceof Long) {
                uNo = (Long) userNoObj;
            } else if (userNoObj != null) {
                uNo = Long.valueOf(userNoObj.toString());
            }
            carts.setUNo(uNo);
            if (carts.getQuantity() == null) {
                carts.setQuantity(1L);
            }

            // 현재 장바구니 수량 조회
            Long cartQty = cartService.getQuantity(uNo, carts.getPNo());
            if (cartQty == null) cartQty = 0L;

            // 상품 재고 조회
            Long stock = productService.selectStockByPNo(carts.getPNo());

            // 추가하려는 수량이 재고를 초과하면 실패
            if (stock == null || cartQty + carts.getQuantity() > stock) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "재고가 부족합니다."
                ));
            }

            cartService.addToCart(carts);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "장바구니에 추가되었습니다."
            ));

        } catch (Exception e) {
            log.error("❌ 장바구니 추가 실패: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "장바구니 추가 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    // ✅ 장바구니 항목 삭제
    @PostMapping("/admin/sellcounter/delete")
    public ResponseEntity<Map<String, Object>> deleteItem(@RequestBody Map<String, Long> body) {
        try {
            Long cNo = body.get("cNo");
            cartService.delete(cNo);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "장바구니에서 삭제되었습니다."
            ));

        } catch (Exception e) {
            log.error("❌ 장바구니 삭제 실패: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "장바구니 삭제 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    // ✅ 장바구니 수량 증가
    @PostMapping("/admin/sellcounter/increase")
    public ResponseEntity<Map<String, Object>> increaseQuantity(@RequestBody Map<String, Long> body, HttpSession session) {
        try {
            Long pNo = body.get("pNo");
            Object userNoObj = session.getAttribute("userNo");
            Long uNo = null;
            if (userNoObj instanceof Integer) {
                uNo = ((Integer) userNoObj).longValue();
            } else if (userNoObj instanceof Long) {
                uNo = (Long) userNoObj;
            } else if (userNoObj != null) {
                uNo = Long.valueOf(userNoObj.toString());
            }

            // 현재 장바구니 수량 조회
            Long cartQty = cartService.getQuantity(uNo, pNo);
            if (cartQty == null) cartQty = 0L;

            // 상품 재고 조회
            Long stock = productService.selectStockByPNo(pNo);

            // 수량 증가 시 재고 초과 체크
            if (stock == null || cartQty + 1 > stock) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "재고가 부족합니다."
                ));
            }

            cartService.increaseQuantity(uNo, pNo);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "수량이 증가되었습니다."
            ));

        } catch (Exception e) {
            log.error("❌ 수량 증가 실패: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "수량 증가 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    // ✅ 장바구니 수량 감소
    @PostMapping("/admin/sellcounter/decrease")
    public ResponseEntity<Map<String, Object>> decreaseQuantity(@RequestBody Map<String, Long> body, HttpSession session) {
        try {
            Long pNo = body.get("pNo");
            Object userNoObj = session.getAttribute("userNo");
            Long uNo = null;
            if (userNoObj instanceof Integer) {
                uNo = ((Integer) userNoObj).longValue();
            } else if (userNoObj instanceof Long) {
                uNo = (Long) userNoObj;
            } else if (userNoObj != null) {
                uNo = Long.valueOf(userNoObj.toString());
            }

            cartService.decreaseQuantity(uNo, pNo);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "수량이 감소되었습니다."
            ));

        } catch (Exception e) {
            log.error("❌ 수량 감소 실패: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "수량 감소 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}
