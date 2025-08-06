package com.aloha.magicpos.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.mapper.LogMapper;
import com.aloha.magicpos.mapper.SeatMapper;
import com.aloha.magicpos.mapper.UserTicketMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * 로그인 성공 처리 이벤트 핸들러
 */
@Slf4j
@Component
public class LoginSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    @Autowired
    private UserTicketMapper userTicketMapper;

    @Autowired
    private LogMapper logMapper;

    @Autowired
    private SeatMapper seatMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws ServletException, IOException {

        log.info("✅ 로그인 성공!");

        // 🍪 아이디 저장 여부 확인
        String rememberId = request.getParameter("remember-id");
        String username = request.getParameter("id");  // name="id"인 input에서 받아옴

        // ✅ 쿠키 처리
        Cookie cookie = new Cookie("remember-id", username);
        cookie.setPath("/");

        if ("on".equals(rememberId)) {
            cookie.setMaxAge(60 * 60 * 24 * 7); // 7일
        } else {
            cookie.setMaxAge(0); // 쿠키 삭제
        }

        response.addCookie(cookie);

        // ✅ 권한에 따라 이동할 페이지 설정
        String redirectUrl = "/";
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        boolean isAdmin = false;
        boolean isUser = false;

        for (GrantedAuthority auth : authorities) {
            if (auth.getAuthority().equals("ROLE_ADMIN")) {
                isAdmin = true;
            } else if (auth.getAuthority().equals("ROLE_USER")) {
                isUser = true;
            }
        }

        if (isAdmin) {
            CustomUser customUser = (CustomUser) authentication.getPrincipal();
            Users user = customUser.getUser();
            

            request.getSession().setAttribute("userNo", user.getNo());
            log.info("🌟 세션에 userNo 저장됨 = {}", user.getNo());
            request.getSession().setAttribute("usageInfo", user);
            redirectUrl = "/admin";
        } else if (isUser) {
            CustomUser customUser = (CustomUser) authentication.getPrincipal();
            Users user = customUser.getUser();
            Long userNo = user.getNo();
            String userName = user.getUsername();

            // 로그인 한 사용자의 총 남은 시간 
            Long remain = userTicketMapper.subRemainTimeByUser(user.getNo());
            int remainingTime = (remain != null) ? remain.intValue() : 0;

            // ✍️ 로그인 로그 저장
            logMapper.insertLog(
                userNo,
                null,
                "로그인/로그아웃",
                userName + "님이 로그인하셨습니다."
            );

            request.getSession().setAttribute("userNo", user.getNo());
            request.getSession().setAttribute("usageInfo", user);

            // 좌석 아이디 처리 
            String seatId = request.getParameter("seatId"); 
            if (seatId != null) {
                seatId = seatId.trim().toUpperCase(); // " s1 " → "S1"
            }
            log.info("입력된 seatId = '{}'", seatId);
            
            // 좌석 상태 확인
            int seatStatus = seatMapper.getSeatStatus(seatId);

            if (seatStatus == 1 || seatStatus == 2) {
                log.warn("⛔ 좌석 사용 불가 (seatId={}, status={})", seatId, seatStatus);
                response.sendRedirect("/login?error=seatInUse");
                return; // 로그인 중단
            }

            // ✅ 좌석 사용 가능 → 예약 등록 + 상태 변경   
            LocalDateTime startTime = LocalDateTime.now();
            LocalDateTime endTime = startTime.plusMinutes(remainingTime);     

            seatMapper.insertSeatReservation(userNo, seatId, startTime, endTime);
            seatMapper.updateSeatStatusToInUse(seatId);

            request.getSession().setAttribute("seatId", seatId);

            log.info("🎫 남은 시간: {}분", remainingTime);

            if (remainingTime <= 0) {
                redirectUrl = "/menu?showTicketModal=true";
            } else {
                redirectUrl = "/menu";
            }
        }

        // 최종 리다이렉트
        response.sendRedirect(redirectUrl);
    }
}