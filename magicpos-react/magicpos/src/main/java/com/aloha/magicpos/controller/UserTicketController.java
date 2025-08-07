package com.aloha.magicpos.controller;

import java.net.InetAddress;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.Tickets;
import com.aloha.magicpos.domain.UserTickets;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.TicketService;
import com.aloha.magicpos.service.UserService;
import com.aloha.magicpos.service.UserTicketService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;



@Slf4j
@RestController
@RequestMapping("/usertickets")
public class UserTicketController {

    @Autowired
    private UserTicketService userticketService;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserService userService;
    
    // 이용권 등록 (결제 시) - 관리자 용     [✔ REST API 구현 완료] 
    @GetMapping("/admin/tickets")
    public List<Tickets> ticketlist(Model model) throws Exception {
        return ticketService.findAll();
    }
    
    // 이용권 등록 전 회원 검색 용          [✔ REST API 구현 완료]
    @GetMapping("/admin/usersearch")
    public List<Map<String,Object>> searchUserByKeywordList(@RequestParam("keyword") String keyword) throws Exception {
        List<Users> users = userService.searchUsersByKeyword(keyword);

        return users.stream().map(user -> {
            Map<String,Object> map = new HashMap<>();
            map.put("userNo", user.getNo());
            map.put("username", user.getUsername());
            map.put("userId", user.getId());
            return map;
        }).collect(Collectors.toList());
    }
    
    
    // 🔸 이용권 등록 (결제 시) - 사용자 화면용
    @PostMapping("/insert")
    public ResponseEntity<String> insertUserTicket(@RequestBody UserTickets userTicket) throws Exception {
        log.info("🧾 받은 userTicket = {}", userTicket);

        // 임시로 setter 강제 사용
        if (userTicket.getUNo() == null) {
            log.error("🔥 uNo가 null이야!");
            return ResponseEntity.badRequest().body("fail");
        }
        boolean success = userticketService.insert(userTicket);
        return ResponseEntity.ok(success ? "success" : "fail");
    }

    // 🔸 전체 이용권 내역 조회 (관리자용)
    @GetMapping
    public List<UserTickets> getAllUserTickets() throws Exception {
        return userticketService.selectAll();
    }

    // 🔸 특정 유저의 이용권 내역 조회
    @GetMapping("/user/{uNo}")
    public List<UserTickets> getUserTicketsByUserNo(@PathVariable long uNo) throws Exception {
        return userticketService.findByUserNo(uNo);
    }


    // 🔸 특정 유저의 남은 시간 조회
    @GetMapping("/user/{uNo}/remain-time")
    public Integer getRemainTime(@PathVariable long uNo) throws Exception {
        return userticketService.findRemainTimeByUserNo(uNo);
    }

    // 🔸 관리자용 요금제 구매 (결제 시)
    @PostMapping("/admin/insert")
    public ResponseEntity<String> insertUserTicketByAdmin(@RequestBody UserTickets userTicket) throws Exception {
        log.info("🧾 관리자 요금제 구매 - 받은 userTicket = {}", userTicket);

        // 유효성 검사
        if (userTicket.getUNo() == null || userTicket.getUNo() == null) {
            log.error("🔥 uNo 또는 tNo가 null이야!");
            return ResponseEntity.badRequest().body("fail");
        }
        
        // 서비스에서 티켓 정보 조회 및 요금제 구매 처리
        boolean success = userticketService.insertUserTicketByAdmin(userTicket);
        log.info("요금제 구매 성공 여부 : ", success);
        return ResponseEntity.ok(success ? "success" : "fail");
    }

    // 🔸 티켓 번호로 티켓 정보 조회 (가격 포함)
    @GetMapping("/ticket/{ticketNo}")
    public ResponseEntity<Map<String, Object>> getTicketInfo(@PathVariable("ticketNo") Long ticketNo) throws Exception {
        log.info("🎫 티켓 정보 조회 시작: ticketNo={}", ticketNo);
        log.info("🎫 요청 URL: /usertickets/ticket/{}", ticketNo);
        
        try {
            Tickets ticket = ticketService.findByNo(ticketNo);
            if (ticket != null) {
                Map<String, Object> ticketInfo = new HashMap<>();
                ticketInfo.put("no", ticket.getNo());
                ticketInfo.put("ticketName", ticket.getTicketName());
                ticketInfo.put("time", ticket.getTime());
                ticketInfo.put("price", ticket.getPrice());
                
                // ✅ 서버 IP 추가
                String serverIp = InetAddress.getLocalHost().getHostAddress();
                ticketInfo.put("serverIp", serverIp);

                log.info("🎫 티켓 정보 조회 완료: {}", ticketInfo);
                return ResponseEntity.ok(ticketInfo);
            } else {
                log.error("🎫 티켓을 찾을 수 없습니다: ticketNo={}", ticketNo);
                Map<String, Object> error = new HashMap<>();
                error.put("error", "티켓을 찾을 수 없습니다.");
                return ResponseEntity.status(404).body(error);
            }
        } catch (Exception e) {
            log.error("🎫 티켓 정보 조회 중 오류: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "티켓 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // 🔸 사용자 결제 정보 반환 (TossPayments 연동용)
    @PostMapping("/payment-info")
    public ResponseEntity<Map<String, Object>> getPaymentInfo(@RequestBody Map<String, Object> params, HttpServletRequest request) throws Exception {
        log.info("#############################################################");
        log.info("client ip : {}", request.getRemoteAddr());
        log.info("server ip : {}", InetAddress.getLocalHost().getHostAddress());
        InetAddress inetAddress = InetAddress.getLocalHost();
        String ip = inetAddress.getHostAddress();
        log.info("#############################################################");
        
        
        Long userNo = Long.valueOf(params.get("userNo").toString());
        Long ticketNo = Long.valueOf(params.get("ticketNo").toString());

        Tickets ticket = ticketService.findByNo(ticketNo);
        Users user = userService.findByNo(userNo);

        // 결제 정보 생성
        String orderId = "order-" + System.currentTimeMillis();
        String orderName = ticket.getTicketName();
        int amount = ticket.getPrice() != null ? ticket.getPrice().intValue() : 0;
        String customerName = user.getUsername();

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("orderName", orderName);
        result.put("amount", amount);
        result.put("customerName", customerName);

        result.put("successUrl", "http://" + ip + ":8080/users/payment/ticket/success?userNo=" + userNo + "&ticketNo=" + ticketNo);
        result.put("failUrl", "http://"+ ip + ":8080/users/payment/ticket/fail");

        return ResponseEntity.ok(result);
    }
}
