package com.aloha.magicpos.initializer;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.aloha.magicpos.mapper.SeatReservationMapper;
import com.aloha.magicpos.service.LogoutService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReservationCleaner implements ApplicationRunner{
    
    private final LogoutService logoutService;
    
    private final SeatReservationMapper seatReservationMapper;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<Long> userNos = seatReservationMapper.findLoggedInUserNosFromSeatStatus();

        for (Long userNo : userNos) {
            logoutService.handleLogoutProcess(userNo);
        }
    }
    
}
