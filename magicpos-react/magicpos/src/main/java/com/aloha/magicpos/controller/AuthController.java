package com.aloha.magicpos.controller;

import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.mapper.LogMapper;
import com.aloha.magicpos.mapper.SeatMapper;
import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.service.LogoutService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Slf4j
public class AuthController {

    private final LogoutService logoutService;
    private final LogService logService;

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            CustomUser customUser = (CustomUser) authentication.getPrincipal();
            Users user = customUser.getUser();
            Long uNo = user.getNo();

            logoutService.handleLogoutProcess(uNo);

            String seatId = (String) request.getSession().getAttribute("seatId");
            String actionType = "로그인/로그아웃";
            String description = user.getUsername() + "님이 로그아웃하셨습니다.";

            logService.insertLog(uNo, seatId, actionType, description);

            log.info("🔒 로그아웃 로그 저장 완료!");
        }
        // 세션 무효화 등 추가 처리 가능
        request.getSession().invalidate();

        return ResponseEntity.ok(Map.of("success", true, "message", "로그아웃 완료"));
    }
}
