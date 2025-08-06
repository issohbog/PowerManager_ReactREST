package com.aloha.magicpos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.aloha.magicpos.domain.Seats;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.SeatService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/seats")
public class SeatController {

    @Autowired
    private SeatService seatService;

    // ✅ 전체 좌석 목록 조회
    @GetMapping
    public String list(Model model) throws Exception {
        List<Seats> seats = seatService.findAll();
        model.addAttribute("seats", seats);
        return "seat/list";
    }

    // ✅ 단일 좌석 상세 조회
    @GetMapping("/{seatId}")
    public String detail(@PathVariable("seatId") String seatId, Model model) throws Exception {
        Seats seat = seatService.findById(seatId);
        model.addAttribute("seat", seat);
        return "seat/detail";
    }

    // ✅ 좌석 상태 변경
    @PostMapping("/{seatId}/status")
    public String updateStatus(@PathVariable("seatId") String seatId,
                               @RequestParam("seatStatus") String seatStatus) throws Exception {
        seatService.updateStatus(seatId, seatStatus);
        return "redirect:/seats";
    }

    // ✅ 좌석 사용 정보 조회 (남은 시간, 사용자 포함)
    @GetMapping("/{seatId}/usage")
    @ResponseBody
    public Map<String, Object> usageInfo(@PathVariable("seatId") String seatId) throws Exception {
        return seatService.findSeatUsageInfo(seatId);
    }

    @GetMapping("/my/usage")
    @ResponseBody
    public Map<String, Object> usageInfo(HttpSession session) throws Exception {
    Users loginUser = (Users) session.getAttribute("loginUser");
    Long userNo = loginUser.getNo();
    return seatService.findSeatUsageInfoByUser(userNo);
    }

    // 예약된 좌석 리스트 반환 (AJAX)
    @GetMapping("/api/reserved")
    @ResponseBody
    public Map<String, Object> reservedSeats() {
        List<String> reservedSeats = seatService.findReservedSeatIds();
        return Map.of("reservedSeats", reservedSeats);
    }

}
