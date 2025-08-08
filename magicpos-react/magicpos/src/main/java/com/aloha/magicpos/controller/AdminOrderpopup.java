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


    // ✅ 장바구니에 항목 추가
    @PostMapping("/admin/sellcounter/add")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Carts carts, HttpSession session) {
        try {
            // userNo 안전하게 변환
            Object userNoObj = session.getAttribute("userNo");
            Long uNo = null;
            if (userNoObj instanceof Integer) {
                uNo = ((Integer) userNoObj).longValue();
            } else if (userNoObj instanceof Long) {
                uNo = (Long) userNoObj;
            } else if (userNoObj != null) {
                uNo = Long.valueOf(userNoObj.toString());
            }
            
            log.info("userNo 세션 값: {}", uNo);
            carts.setUNo(uNo);
            if (carts.getQuantity() == null) {
                carts.setQuantity(1L);
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
    public ResponseEntity<Map<String, Object>> deleteItem(@RequestParam("cNo") Long cNo) {
        try {
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
    public ResponseEntity<Map<String, Object>> increaseQuantity(@RequestParam("pNo") Long pNo, HttpSession session) {
        try {
            // userNo 안전하게 변환
            Object userNoObj = session.getAttribute("userNo");
            Long uNo = null;
            if (userNoObj instanceof Integer) {
                uNo = ((Integer) userNoObj).longValue();
            } else if (userNoObj instanceof Long) {
                uNo = (Long) userNoObj;
            } else if (userNoObj != null) {
                uNo = Long.valueOf(userNoObj.toString());
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
    public ResponseEntity<Map<String, Object>> decreaseQuantity(@RequestParam("pNo") Long pNo, HttpSession session) {
        try {
            // userNo 안전하게 변환
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
