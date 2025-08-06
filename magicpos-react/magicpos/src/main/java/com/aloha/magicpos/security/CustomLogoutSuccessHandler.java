package com.aloha.magicpos.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.mapper.LogMapper;
import com.aloha.magicpos.mapper.SeatMapper;
import com.aloha.magicpos.service.LogoutService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

    @Autowired
    private LogMapper logMapper;

    @Autowired
    private SeatMapper seatMapper;

    @Autowired
    private LogoutService logoutService;

    @Override
    public void onLogoutSuccess(HttpServletRequest request,
                                HttpServletResponse response,
                                Authentication authentication) throws IOException, ServletException {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            CustomUser customUser = (CustomUser) authentication.getPrincipal();
            Users user = customUser.getUser();
            Long uNo = user.getNo();

            // 시간 차감 및 좌석 종료 트랜잭션 처리 
            logoutService.handleLogoutProcess(uNo);

            // 🔥 로그 저장
            String seatId = (String) request.getSession().getAttribute("seatId"); 
            String actionType = "로그인/로그아웃";
            String description = user.getUsername() + "님이 로그아웃하셨습니다.";

            logMapper.insertLog(uNo, seatId, actionType, description);

            log.info("🔒 로그아웃 로그 저장 완료!");

            // // 🔥 좌석 종료 처리
            // seatMapper.updateSeatEndTime(uNo);
            // seatMapper.releaseSeatStatus(uNo);  // seat_id는 서브쿼리로 찾아감
            // log.info("🪑 좌석 end_time 및 status 갱신 완료!");
        }

        // 로그아웃 후 이동할 URL
        response.sendRedirect("/login?logout=true");
    }
}
