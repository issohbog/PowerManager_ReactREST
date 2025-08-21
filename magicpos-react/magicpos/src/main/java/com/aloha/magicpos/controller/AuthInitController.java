package com.aloha.magicpos.controller;

import java.time.LocalDateTime;
import java.time.Instant;
import java.util.Map;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import jakarta.servlet.http.Cookie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Seats;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.exception.SeatUnavailableException;
import com.aloha.magicpos.mapper.SeatMapper;
import com.aloha.magicpos.mapper.UserTicketMapper;
import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.service.SeatReservationService;
import com.aloha.magicpos.service.SeatService;
import com.aloha.magicpos.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthInitController {

    private final UserTicketMapper userTicketMapper;
    private final LogService logService;
    private final SeatMapper seatMapper;
    private final SeatService seatService; // 좌석 스냅샷 조회용
    private final SimpMessagingTemplate messagingTemplate; // 실시간 브로드캐스트
    private final UserService userService; // 필요시

    @Autowired
    private SeatReservationService seatReservationService;

    @PostMapping("/after-login")
    public ResponseEntity<?> afterLogin(
            @AuthenticationPrincipal CustomUser cu,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception {

        if (cu == null || cu.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "인증이 필요합니다."));
        }

        Users user = cu.getUser();
        Long userNo = user.getNo();
        String username = user.getUsername();

        // 1) remember-id 쿠키
        String rememberId = toStr(body.get("rememberId")); // "on" / true / "true"
        String idForCookie = toStr(body.get("id"));        // 로그인 때 입력한 id
        if (idForCookie != null) {
            Cookie cookie = new Cookie("remember-id", idForCookie);
            cookie.setPath("/");
            // 필요하면 cookie.setHttpOnly(true); cookie.setSecure(true);
            if ("on".equalsIgnoreCase(rememberId) || "true".equalsIgnoreCase(rememberId)) {
                cookie.setMaxAge(60 * 60 * 24 * 7); // 7일
            } else {
                cookie.setMaxAge(0); // 삭제
            }
            response.addCookie(cookie);
        }

        // 권한별 분기: 관리자면 좌석/시간 로직 불필요
        boolean isAdmin = cu.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            log.info("관리자 로그인 초기화 완료: userNo={}", userNo);
            // 로그인 로그 저장 (선택)
            logService.insertLog(userNo, null, "로그인/로그아웃", username + "님이 로그인하셨습니다.");
            return ResponseEntity.ok(Map.of("success", true, "redirect", "/admin"));
        }

        // 사용자일 때만 좌석/시간 처리
        String seatId = toStr(body.get("seatId"));
        if (seatId != null) seatId = seatId.trim().toUpperCase();
        log.info("입력된 seatId = '{}'", seatId);

        // 남은 시간
        Long remain = userTicketMapper.subRemainTimeByUser(userNo);
        int remainingTime = (remain != null) ? remain.intValue() : 0;

        // 로그인 로그
        logService.insertLog(userNo, null, "로그인/로그아웃", username + "님이 로그인하셨습니다.");

        // seatId가 오면 좌석 점유/예약
        if (seatId != null && !seatId.isBlank()) {
            try {
                seatReservationService.reserve(userNo, seatId, remainingTime, username);

            } catch (SeatUnavailableException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, 
                                     "code", e.code(),
                                     "message", e.getMessage()
                                    ));
            }
            // int seatStatus = seatMapper.getSeatStatus(seatId);
            // if (seatStatus == 1 || seatStatus == 2) {
            //     log.warn("⛔ 좌석 사용 불가 (seatId={}, status={})", seatId, seatStatus);
            //     return ResponseEntity.badRequest()
            //             .body(Map.of("success", false, "code", "seatInUse",
            //                          "message", "이미 사용 중이거나 고장난 좌석입니다."));
            // }

            // LocalDateTime startTime = LocalDateTime.now();
            // LocalDateTime endTime = startTime.plusMinutes(remainingTime);

            // seatMapper.insertSeatReservation(userNo, seatId, startTime, endTime);
            // seatMapper.updateSeatStatusToInUse(seatId);

            // // ✅ 좌석 예약 로그 (좌석ID 포함) → 관리자 로그 스트림(/topic/admin/logs)
            // logService.insertLog(
            //     userNo,
            //     seatId,
            //     "좌석예약",
            //     username + "님이 " + seatId + " 사용을 시작했습니다. (잔여 " + remainingTime + "분)"
            // );

            // PATCH (증분 업데이트) 전송 : 바뀐 좌석 1개만 
            // Map<String, Object> patch = new HashMap<>();
            // patch.put("type", "PATCH");
            // patch.put("updatedAt", Instant.now().toString());
            // patch.put("seat", Map.of(
            //     "seatId", seatId, 
            //     "status", 1,            //  1 : 사용중 
            //     "className", "in-use",  // 클래스 명칭은 프런트와 합의 
            //     "username", username, 
            //     "remainTime", remainingTime
            // ));
            // messagingTemplate.convertAndSend("/topic/admin/seats", patch);

            // // ✅ 관리자 좌석 대시보드 실시간 갱신: 전체 스냅샷 브로드캐스트 (/topic/admin/seats)
            // try {
            //     // username / remainTime 이 포함된 섹션 구조 얻기
            //     Map<String, List<Seats>> sections = seatService.getSeatSections();
            //     // 섹션별로 필요한 필드만 추림
            //     Map<String, Object> payload = new HashMap<>();
            //     payload.put("type", "SNAPSHOT");
            //     payload.put("updatedAt", Instant.now().toString());
            //     for (String key : new String[]{"topSeats","middleSeats","bottomSeats"}) {
            //         List<Seats> list = sections.getOrDefault(key, Collections.emptyList());
            //         List<Map<String,Object>> slim = new ArrayList<>();
            //         for (Seats s : list) {
            //             Map<String,Object> m = new HashMap<>();
            //             m.put("seatId", s.getSeatId());
            //             m.put("status", s.getSeatStatus());
            //             m.put("className", s.getClassName());
            //             m.put("username", s.getUsername());
            //             m.put("remainTime", s.getRemainTime());
            //             slim.add(m);
            //         }
            //         payload.put(key, slim);
            //     }
            //     messagingTemplate.convertAndSend("/topic/admin/seats", payload);
            // } catch (Exception e) {
            //     log.warn("좌석 스냅샷 브로드캐스트 실패", e);
            // }
        }

        // 세션을 안 쓰는 JWT 구조라면 seatId/usageInfo는 DB에서 필요할 때마다 조회하세요.
        // (정말 세션이 필요하면 최소한으로만 사용)

        String redirect = (remainingTime <= 0) ? "/menu?showTicketModal=true" : "/menu";
        return ResponseEntity.ok(Map.of("success", true, "redirect", redirect,
                                        "remainingTime", remainingTime));
    }

    private String toStr(Object o) { return o == null ? null : o.toString(); }
}
