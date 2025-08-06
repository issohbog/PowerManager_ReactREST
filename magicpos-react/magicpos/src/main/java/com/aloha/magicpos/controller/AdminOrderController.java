package com.aloha.magicpos.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
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
@Controller
@RequestMapping("/admin/orders")
public class AdminOrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;
    
    // 🔸 주문 등록
    // @PostMapping("/create")
    // public String insertOrder(
    //     Orders order, // 기본 주문 정보는 그대로 받고
    //     @RequestParam("seatId") String seatId,
    //     @RequestParam("pNoList") List<Long> pNoList,
    //     @RequestParam("quantityList") List<Long> quantityList,
    //     @RequestParam("pNameList") List<String> pNameList, // 상품 이름 리스트 추가
    //     RedirectAttributes rttr, // 리다이렉트 시 플래시 속성 사용
    //     HttpSession session // 세션에서 사용자 정보 가져오기
    //     ) throws Exception {
    //         // ✅ 1. 세션에서 userNo 가져오기
    //         Long userNo = (Long) session.getAttribute("userNo");
            
    //         // ✅ 2. 세션에 없으면 임시 userNo로 설정
    //         if (userNo == null) {
    //             userNo = 1L; // 임시 유저 번호
    //             session.setAttribute("userNo", userNo);
    //         }
    //         // ✅ 3. 주문 전 재고 체크
    //         for (int i = 0; i < pNoList.size(); i++) {
    //             Long pNo = pNoList.get(i);
    //             Long quantity = quantityList.get(i);
    //             String pName = pNameList.get(i);

    //             // 이 메서드에서 재고 수량 조회
    //             Long currentStock = productService.selectStockByPNo(pNo);  // 아래에 구현 설명 있음

    //             if (currentStock == null || currentStock < quantity) {
    //                 rttr.addFlashAttribute("error", pName + "의 재고가 부족합니다.");
    //                 return "redirect:/menu";
    //             }
    //         }
    //         // 🔽 여기서 seatId 로그 확인
    //         log.debug("넘어온 seatId: {}", order.getSeatId());
    //         order.setUNo(userNo); // 주문에 사용자 번호 설정
    //         order.setOrderStatus(0L); // 기본 주문 상태 설정
    //         order.setPaymentStatus(0L); // 기본 결제 상태 설정
    //         order.setSeatId(seatId);
    //         boolean inserted = orderService.insertOrder(order);
    //         if (!inserted) return "redirect:/orders/fail";
            
    //         Long oNo = order.getNo(); // insert 후에 받아온 주문 번호

    //         // 상품별 주문 상세 넣기
    //         for (int i = 0; i < pNoList.size(); i++) {
    //             OrdersDetails detail = new OrdersDetails();
    //         detail.setONo(oNo);
    //         detail.setPNo(pNoList.get(i));
    //         detail.setQuantity(quantityList.get(i));
    //         orderService.insertOrderDetail(oNo, detail);
    //         // 상품 재고 감소
    //         productService.decreaseStock(pNoList.get(i), quantityList.get(i));
    //     }
    //     // 장바구니 비우기
    //     cartService.deleteAllByUserNo(userNo);
        
    //     rttr.addFlashAttribute("orderSuccess", true);
    //     return "redirect:/menu";
    // }
    
    // 🔸 주문 삭제 (주문 + 상세 함께 삭제)
    @PostMapping("/delete")
    public String deleteOrder(@RequestParam("orderNo") Long orderNo) throws Exception {
        // 🔍 삭제 전에 해당 주문의 모든 상품 수량을 조회
        List<Map<String, Object>> details = orderService.findDetailsWithProductNames(orderNo);
        for (Map<String, Object> detail : details) {
            Long pNo = ((Number) detail.get("p_no")).longValue();
            Long quantity = ((Number) detail.get("quantity")).longValue();
            productService.increaseStock(pNo, quantity);
    }
        orderService.deleteOrder(orderNo);
        return "redirect:/admin/orderpopup/fetch?status=0";
    }
    
    // 🔸 주문 상세 삭제 (단일 상품)
    @PostMapping("/delete/detail")
    public String deleteOrderDetail(@RequestParam("oNo") Long oNo, @RequestParam("pNo") Long pNo, Model model, RedirectAttributes redirectAttributes) throws Exception{
        Long quantity = orderService.getQuantityByOrderAndProduct(oNo, pNo);
        orderService.deleteOrderDetail(oNo, pNo);
        productService.increaseStock(pNo, quantity);
        // 🔥 주문정보 다시 조회
        Orders order = orderService.findOrderByNo(oNo);
        if (order == null) {
            redirectAttributes.addFlashAttribute("error", "주문이 삭제되었습니다.");
            return "redirect:/admin/orderpopup/fetch?status=0";
        }
        List<Map<String, Object>> orderDetails = orderService.findDetailsWithProductNames(oNo);

        // 🔥 모델에 담기
        model.addAttribute("order", order);
        model.addAttribute("orderDetails", orderDetails);


        return "redirect:/admin/orderpopup/fetch?status=0";
    }
    // 🔸 주문 상세 1 수량 증가
    @PostMapping("/increaseQuantity")
    public String increaseOrderDetailQuantity(@RequestParam("oNo") Long orderNo,
                                               @RequestParam("pNo") Long productNo) throws Exception {
        orderService.increaseQuantity(orderNo, productNo);
        productService.decreaseStock(productNo, 1L);
        return "redirect:/admin/orderpopup/fetch?status=0";
    }
    
    // 🔸 주문 상세 1 수량 감소
    @PostMapping("/decreaseQuantity")
    public String decreaseOrderDetailQuantity(@RequestParam("oNo") Long orderNo,
    @RequestParam("pNo") Long productNo) throws Exception {
        orderService.decreaseQuantity(orderNo, productNo);
        productService.increaseStock(productNo, 1L);
        return "redirect:/admin/orderpopup/fetch?status=0";
    }
    
    // 🔸 주문 상세 수량 수정
    @PostMapping("/updateQuantity")
    public String updateOrderDetailQuantity(@RequestParam Long orderNo,
                                            @RequestParam Long productNo,
                                            @RequestParam Long quantity) throws Exception {
        orderService.updateOrderDetailQuantity(orderNo, productNo, quantity);
        return "redirect:/admin/orderpopup/fetch?status=0";
    }

    // 🔸 주문 상세 등록
    @PostMapping("/{oNo}/details")
    public String insertOrderDetail(@PathVariable Long oNo, @RequestBody OrdersDetails detail) throws Exception{
        orderService.insertOrderDetail(oNo, detail);
        return "order_detail_created";
    }

    // 🔸 주문 상태/결제 상태 수정
    @PutMapping("/{no}/status")
    public String updateStatus(@PathVariable Long no,
                               @RequestParam Long orderStatus,
                               @RequestParam Long paymentStatus) 
        throws Exception{
        orderService.updateStatus(no, orderStatus, paymentStatus);
        return "order_status_updated";
    }


    // 🔸 모든 주문 조회
    @GetMapping
    public List<Orders> findAllOrders() throws Exception {
        return orderService.findAllOrders();
    }

    // 🔸 특정 사용자 주문 목록 조회(사용자페이지 사용)
    @GetMapping("/user")
    public List<Orders> findOrdersByUser(@PathVariable Long uNo) throws Exception {
        return orderService.findOrdersByUser(uNo);
    }

    // 🔸 단일 주문 조회
    @GetMapping("/{no}")
    public Orders findOrderByNo(@PathVariable Long no) throws Exception {
        return orderService.findOrderByNo(no);
    }

    // 🔸 주문 상세 목록 조회 (단순)
    @GetMapping("/{oNo}/details")
    public List<OrdersDetails> findOrderDetails(@PathVariable Long oNo) throws Exception {
        return orderService.findOrderDetails(oNo);
    }

    // 🔸 주문 상세 목록 조회 (상품명 + 가격 포함)
    @GetMapping("/{oNo}/details/products")
    public List<Map<String, Object>> findDetailsWithProductNames(@PathVariable Long oNo) throws Exception{
        return orderService.findDetailsWithProductNames(oNo);
    }




    // 주문 상태 변경
    @PutMapping("/{no}/status/update")
    public String updateOrderStatus(@PathVariable Long no,
                                    @RequestParam Long orderStatus,
                                    @RequestParam Long paymentStatus) 
        throws Exception {
        orderService.updateStatus(no, orderStatus, paymentStatus);
        return "order_status_updated";
    }

    // 주문 상태 변경(AJAX)
    @PostMapping("/status")
    @ResponseBody
    // public String updateOrderStatusAjax(@RequestParam("no") Long no,
    //                                     @RequestParam("orderStatus") Long orderStatus) {
    // public String updateOrderStatusAjax(@RequestParam Map<String, String> params) {
    public String updateOrderStatusAjax(@RequestParam Map<String, String> params) {
    // public String updateOrderStatusAjax(@RequestBody Map<String, String> params) {
        try {
            Long no = Long.parseLong(params.get("no"));
            Long orderStatus = Long.parseLong(params.get("orderStatus"));
            log.info("🔥 상태 변경 요청: no={}, status={}", no, orderStatus);

            Orders order = orderService.findOrderByNo(no);
            if (order == null) {
                log.warn("❗ 주문 없음: no={}", no);
                return "fail";
            }

            Long paymentStatus = order.getPaymentStatus();
            if (paymentStatus == null) {
                log.warn("❗ 결제 상태 없음: orderNo={}", no);
                return "fail";
            }

            orderService.updateStatusWithPayAt(no, orderStatus, paymentStatus);
            return "ok";
        } catch (Exception e) {
            log.error("❗ 상태 변경 중 오류 발생", e);
            return "fail";
        }
    }

    // 주문 상태 카운트 조회 (AJAX)
    @GetMapping("/status/counts")
    @ResponseBody
    public Map<String, Long> getOrderCounts() throws Exception {
        Map<String, Long> counts = new HashMap<>();
        counts.put("orderCount", orderService.countByStatus(List.of(0L, 1L)));
        counts.put("prepareCount", orderService.countByStatus(List.of(1L)));
        return counts;
    }

    @GetMapping("/cart/json")
    @ResponseBody
    public List<Map<String, Object>> getCartList(HttpSession session) {
        Object userNoObj = session.getAttribute("userNo");
        Long userNo = null;
        if (userNoObj instanceof Integer) {
            userNo = ((Integer) userNoObj).longValue();
        } else if (userNoObj instanceof Long) {
            userNo = (Long) userNoObj;
        } else if (userNoObj != null) {
            userNo = Long.valueOf(userNoObj.toString());
        }
        return cartService.findCartWithProductByUser(userNo);
    }
}