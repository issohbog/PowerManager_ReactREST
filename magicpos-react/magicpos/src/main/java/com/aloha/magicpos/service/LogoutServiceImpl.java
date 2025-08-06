package com.aloha.magicpos.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.magicpos.domain.SeatsReservations;
import com.aloha.magicpos.domain.UserTickets;
import com.aloha.magicpos.mapper.SeatMapper;
import com.aloha.magicpos.mapper.SeatReservationMapper;
import com.aloha.magicpos.mapper.UserTicketMapper;

@Service
public class LogoutServiceImpl implements LogoutService {

    @Autowired
    private SeatReservationMapper seatReservationMapper;

    @Autowired
    private UserTicketMapper userTicketMapper;

    @Autowired
    private SeatMapper seatMapper;

    @Override
    @Transactional
    public void handleLogoutProcess(Long userNo) {
        // 1. 사용자 좌석 예약 정보 조회
        SeatsReservations reservation = seatReservationMapper.findCurrentReservationByUser(userNo);
        if(reservation != null){
            LocalDateTime start = reservation.getStartTime().toLocalDateTime();
            LocalDateTime now = LocalDateTime.now();
            long usedMinutes = Duration.between(start, now).toMinutes();            // 차감 할 사용자 이용시간

            // 2. 좌석 예약 테이블 end_time 현재시간으로 업데이트 
            seatReservationMapper.updateEndTime(userNo, now);

            // 3. user_ticket 테이블에서 remain_time [오래된 순으로 ] 이용시간 만큼 차감
            List<UserTickets> userTickets = userTicketMapper.findUserTicketsOrderByOldest(userNo);
            for(UserTickets userTicket : userTickets){ 

                if(usedMinutes <= 0 ) break;
                
                long remainTime = userTicket.getRemainTime();
                
                if(remainTime >= usedMinutes){
                    userTicketMapper.updateRemainTime(userTicket.getNo(), remainTime - usedMinutes);
                    usedMinutes = 0;
                }else{
                    userTicketMapper.updateRemainTime(userTicket.getNo(), 0L);
                    usedMinutes -= remainTime;
                }
            }
            // 4. 좌석 상태 청소중으로 변경
            seatMapper.releaseSeatStatus(userNo);
        }

    }
}
