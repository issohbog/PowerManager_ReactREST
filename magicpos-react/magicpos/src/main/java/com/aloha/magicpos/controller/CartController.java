package com.aloha.magicpos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;

import com.aloha.magicpos.domain.Carts;
import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.ProductService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/carts")
public class CartController {
    @Autowired
    private CartService cartService;
    
    @Autowired
    private ProductService productService;

    // 장바구니에 항목 추가
    @PostMapping("/add")
    @ResponseBody
    public ResponseEntity<?> addToCartRest(@RequestBody Carts carts, HttpSession session, @AuthenticationPrincipal CustomUser cu) {
        try {
            log.info("🧪 받은 carts 데이터: {}", carts);
            log.info("🧪 carts.getPNo(): {}", carts.getPNo());
            
            // ✅ 2. userNo 안전하게 변환
            Long uNo = cu.getUser().getNo();
            
            carts.setUNo(uNo);
            
            if (carts.getQuantity() == null) {
                carts.setQuantity(1L);
            }
            
            log.info("🧪 최종 carts 데이터: uNo={}, pNo={}, quantity={}", 
                    carts.getUNo(), carts.getPNo(), carts.getQuantity());
            
            cartService.addToCart(carts);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("장바구니 추가 실패: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 장바구니 항목 삭제
    @PostMapping("/delete")
    @ResponseBody
    public ResponseEntity<?> deleteItemRest(@RequestBody(required = false) Long cNo, @RequestParam(value = "cNo", required = false) Long cNoParam) {
        try {
            Long targetCNo = cNo != null ? cNo : cNoParam;
            cartService.delete(targetCNo);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    // 장바구니 수량 증가
    @PostMapping("/increase")
    @ResponseBody
    public ResponseEntity<?> increaseQuantityRest(
        @RequestBody(required = false) Long pNo,
        @RequestParam(value = "pNo", required = false) Long pNoParam,
        HttpSession session, @AuthenticationPrincipal CustomUser cu
    ) {
        try {
            // ✅ uNo 안전하게 변환
            Long uNo = cu.getUser().getNo();
            Long targetPNo = pNo != null ? pNo : pNoParam;

            // 현재 장바구니 수량 조회
            Long cartQty = cartService.getQuantity(uNo, targetPNo);
            if (cartQty == null) cartQty = 0L;

            // 상품 재고 조회
            Long stock = productService.selectStockByPNo(targetPNo);

            // 수량 증가 시 재고 초과 체크
            if (stock == null || cartQty + 1 > stock) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "재고가 부족합니다."
                ));
            }

            cartService.increaseQuantity(uNo, targetPNo);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 장바구니 수량 감소
    @PostMapping("/decrease")
    @ResponseBody
    public ResponseEntity<?> decreaseQuantityRest(
        @RequestBody(required = false) Long pNo, 
        @RequestParam(value = "pNo", required = false) Long pNoParam, 
        HttpSession session, @AuthenticationPrincipal CustomUser cu) {
        try {
            // ✅ uNo 안전하게 변환
            Long uNo = cu.getUser().getNo();
            Long targetPNo = pNo != null ? pNo : pNoParam;
            cartService.decreaseQuantity(uNo, targetPNo);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", e.getMessage()));
        }
    }


    // 사용자 장바구니 전체 조회
    @GetMapping("/{uNo}")
    @ResponseBody
    public ResponseEntity<?> getUserCartRest(@PathVariable Long uNo) {
        try {
            List<Carts> carts = cartService.getUserCart(uNo);
            return ResponseEntity.ok(Map.of("success", true, "carts", carts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
