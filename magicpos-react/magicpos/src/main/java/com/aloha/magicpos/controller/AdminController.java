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
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.aloha.magicpos.domain.Carts;
import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.domain.Seats;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.CartService;
import com.aloha.magicpos.service.CategoryService;
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
@Controller
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
    private UserService userService;

    @Autowired
    private SeatReservationService seatReservationService;

    @GetMapping("/admin/orderpopup/fetch")
    public String fetchOrderPopup(@RequestParam(name = "status", required = false) String status, Model model) throws Exception {
    List<Long> statusList = "1".equals(status) ? List.of(1L) : List.of(0L, 1L);
    List<Orders> orderList = orderService.findOrdersByStatus(statusList);
    
    System.out.println("🔥 orderList size: " + orderList.size());
    model.addAttribute("orderList", orderList);

    Map<Long, List<Map<String, Object>>> orderDetailsMap = new HashMap<>();
    Map<Long, String> menuNamesMap = new HashMap<>();
    Map<Long, Long> waitTimeMap = new HashMap<>();
    long now = System.currentTimeMillis();

    for (Orders order : orderList) {
        Long oNo = order.getNo();
        List<Map<String, Object>> details = orderService.findDetailsWithProductNames(oNo);

        if (details == null) details = new ArrayList<>();
        orderDetailsMap.put(oNo, details);

        // 메뉴 이름 조합
        String names = details.stream()
            .map(d -> {
                String name = d.get("p_name") != null ? d.get("p_name").toString() : "이름없음";
                Object qObj = d.get("quantity");
                int quantity = (qObj != null) ? Integer.parseInt(qObj.toString()) : 1;
                return name + "(" + quantity + ")";
            })
            .collect(Collectors.joining(", "));
        menuNamesMap.put(oNo, names);

        // 대기 시간 계산
        if (order.getOrderTime() != null) {
            long waitMillis = now - order.getOrderTime().getTime();
            waitTimeMap.put(oNo, waitMillis / (60 * 1000));
        } else {
            waitTimeMap.put(oNo, 0L);
        }
    }

    model.addAttribute("menuNamesMap", menuNamesMap);
    model.addAttribute("orderDetailsMap", orderDetailsMap);
    model.addAttribute("orderCount", orderService.countByStatus(List.of(0L, 1L)));
    model.addAttribute("preparingCount", orderService.countByStatus(List.of(1L)));
    model.addAttribute("waitTime", waitTimeMap);
    model.addAttribute("requestURI", "/admin/orderpopup");

    return "fragments/admin/orderpopup :: orderpopup"; // ✅ fragment만!
    }


    @GetMapping("/admin")
    public String findAllSeat(Model model) throws Exception {
        
        Map<String, List<Seats>> seatMap = seatService.getSeatSections();

        model.addAttribute("topSeats", seatMap.get("topSeats"));
        model.addAttribute("middleSeats", seatMap.get("middleSeats"));
        model.addAttribute("bottomSeats", seatMap.get("bottomSeats"));

        List<Map<String, Object>> currentUsage = seatReservationService.findCurrentSeatUsage();
        model.addAttribute("currentUsage", currentUsage);

        
        return "pages/admin/seat_status";
    
    }

    @PostMapping("/admin/seats/clear/{seatId}")
    @ResponseBody
    public String O(@PathVariable("seatId") String seatId) {
        try {
            boolean result = seatService.clearSeat(seatId);
            return result ? "success" : "fail";
        } catch (Exception e) {
            return "error";
        }   
    }

    // @GetMapping("/admin/sell/counter")
    // public String sellcounter(@RequestParam(name = "keyword", required = false) String keyword, @RequestParam(name = "category", required = false) Long categoryNo, Model model, HttpSession session) throws Exception {
    //     // ✅ 1. 세션에서 userNo 안전하게 변환
    //     Object userNoObj = session.getAttribute("userNo");
    //     Long userNo = null;
    //     if (userNoObj instanceof Integer) {
    //         userNo = ((Integer) userNoObj).longValue();
    //     } else if (userNoObj instanceof Long) {
    //         userNo = (Long) userNoObj;
    //     } else if (userNoObj != null) {
    //         userNo = Long.valueOf(userNoObj.toString());
    //     }
    //     // ✅ 2. 세션에 없으면 임시 userNo로 설정
    //     if (userNo == null) {
    //         userNo = 1L; // 임시 유저 번호
    //         session.setAttribute("userNo", userNo);
    //     }
    //     // ✅ 3. 상품 목록 조회(검색, 필터 기능 포함)
    //     List<Products> products;

    //     if (keyword != null && !keyword.trim().isEmpty()) {
    //         products = productService.searchProductsAll(keyword, categoryNo); // 검색 + 카테고리
    //     } else if (categoryNo != null) {
    //         products = productService.findByCategory(categoryNo); // 카테고리만
    //     } else {
    //         products = productService.findAll(); // 전체
    //     }
    //     model.addAttribute("products", products);
    //     // -------------------------------------------------------------------
    //     // 장바구니
    //     List<Map<String, Object>> cartList = cartService.getCartWithProductByUser(userNo);
    //     if (cartList == null) {
    //         cartList = new ArrayList<>();
    //     }
    //     model.addAttribute("cartList", cartList);
        
    //     // 장바구니 총 주문 금액
    //     int totalPrice = cartService.getTotalPrice(userNo);
    //     model.addAttribute("totalPrice", totalPrice);

        
    //     List<Categories> categories = categoryService.findAll();
        
    //     // List<Categories>를 MCategories 객체들을 카테고리번호(no)를 키, 카테고리이름(cName)을 값으로 해서 
    //     // Map<번호, 이름> 형태로 변환
    //     Map<Long, String> categoryMap = categories.stream()
    //     .collect(Collectors.toMap(Categories:: getNo, Categories::getCName));
        
        
    //     model.addAttribute("categories", categories);
    //     model.addAttribute("products", products);
    //     model.addAttribute("categoryMap", categoryMap);
    //     return "pages/admin/sellcounter";
    // }

    // 카테고리 불러오기
    @GetMapping("/admin/categories/json")
    @ResponseBody
    public List<Categories> getAllCategories() throws Exception {
        return categoryService.findAll();
    }
    
    // 장바구니에 항목 추가
    @PostMapping("/admin/sellcounter/add")
    @ResponseBody
    public String addToCart(Carts carts, HttpSession session) throws Exception {
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
        System.out.println("userNo 세션 값: " + uNo);
        carts.setUNo(uNo); // 서버에서 직접 넣어줌
        if (carts.getQuantity() == null) {
            carts.setQuantity(1L); // 기본값 1
        }
        cartService.addToCart(carts);
        return "ok";
    }

    // 장바구니 항목 삭제
    @PostMapping("/admin/sellcounter/delete")
    @ResponseBody
    public String deleteItem(@RequestParam("cNo") Long cNo) throws Exception{
        cartService.delete(cNo);
        return "ok";
    }
    
    // 장바구니 수량 증가
    @PostMapping("/admin/sellcounter/increase")
    @ResponseBody
    public String increaseQuantity(@RequestParam("pNo") Long pNo, HttpSession session) throws Exception{
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
        return "ok";
    }

    // 장바구니 수량 감소
    @PostMapping("/admin/sellcounter/decrease")
    @ResponseBody
    public String decreaseQuantity(@RequestParam("pNo") Long pNo, HttpSession session) throws Exception{
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
        cartService.decreaseQuantity(uNo,pNo);
        return "ok";
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
        HttpSession session
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

        // ✅ 세션 유저 설정 (안전하게 변환)
        Object userNoObj = session.getAttribute("userNo");
        Long userNo = null;
        if (userNoObj instanceof Integer) {
            userNo = ((Integer) userNoObj).longValue();
        } else if (userNoObj instanceof Long) {
            userNo = (Long) userNoObj;
        } else if (userNoObj != null) {
            userNo = Long.valueOf(userNoObj.toString());
        }
        if (userNo == null) {
            userNo = 1L; // 테스트용 기본값
            session.setAttribute("userNo", userNo);
        }

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
    @GetMapping("/admin/users/modal")
    public String getUserListModal(@RequestParam(name = "keyword", required = false) String keyword, Model model) {
        List<Map<String, Object>> users = seatService.searchActiveUsers(keyword);
        System.out.println("사용자 수: " + users.size());
        model.addAttribute("users", users);
        System.out.println("🧪 조회된 사용자 수: " + users.size());
        for (Map<String, Object> user : users) {
            System.out.println(user);
        }
        return "fragments/admin/modal/userlistcontent :: userlistcontent";
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
        result.put("successUrl", "http://" + ip + ":8080/admin/payment/product/success");
        result.put("failUrl", "http://"+ ip + ":8080/admin/payment/product/fail");

        return result;
    }

    @PostMapping("/admin/orders/temp")
    @ResponseBody
    public String saveAdminTempOrder(@RequestBody Map<String, Object> tempOrder, HttpSession session) {
        session.setAttribute("tempOrder", tempOrder);
        return "ok";
    }
}
    

