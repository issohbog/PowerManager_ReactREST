package com.aloha.magicpos.service;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.magicpos.domain.SeatsReservations;
import com.aloha.magicpos.domain.Tickets;
import com.aloha.magicpos.domain.UserTickets;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.mapper.SeatReservationMapper;
import com.aloha.magicpos.mapper.UserTicketMapper;
import com.aloha.magicpos.service.TicketService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("UserTicketService")
public class UserTicketServiceImpl implements UserTicketService {

    @Autowired UserTicketMapper userTicketMapper;
    
    @Autowired TicketService ticketService;

    @Autowired SeatReservationMapper seatReservationMapper;

    @Autowired UserService userService;

    @Autowired LogService logService;

    @Override
    public boolean insert(UserTickets userTicket) throws Exception {
        return userTicketMapper.insert(userTicket) > 0;
    }

    @Override
    public List<UserTickets> selectAll() throws Exception {
        return userTicketMapper.selectAll();
    }

    @Override
    public List<UserTickets> findByUserNo(long uNo) throws Exception {
        return userTicketMapper.findByUserNo(uNo);
    }

    @Override
    public Integer findRemainTimeByUserNo(long uNo) throws Exception {
        return userTicketMapper.findRemainTimeByUserNo(uNo);
    }

    @Override
    public Long getTotalRemainTime(Long userNo) {
        return userTicketMapper.subRemainTimeByUser(userNo);
    }
    
    @Override
    @Transactional
    public boolean insertUserTicketByAdmin(UserTickets userTicket) throws Exception {
        log.info("🎫 서비스에서 티켓 정보 조회 및 요금제 구매 처리");
        
        // 티켓 정보 조회
        Tickets ticket = ticketService.findById(userTicket.getTNo());
        if(ticket == null) return false;
        log.info("############ 티켓 정보 있음 : {}", ticket);

        long ticketMinutes = ticket.getTime();
        userTicket.setRemainTime(ticketMinutes); // 티켓의 시간을 remainTime으로 설정

        // userticket insert
        int insertCount = userTicketMapper.insert(userTicket);
        if(insertCount == 0) return false;
        log.info("############ 티켓 등록됨 : {}", insertCount);

        // 사용자 좌석 예약 중인지 확인 
        SeatsReservations reservation = seatReservationMapper.findCurrentReservationByUser(userTicket.getUNo());
        log.info("사용자 좌석 예약 여부 : {}", reservation);

        if (reservation != null && reservation.getEndTime().after(new Timestamp(System.currentTimeMillis()))) {
            // endTime이 현재보다 나중이다 (아직 사용 중)
            // 기존 end_time 에 ticket 시간만큼 추가
            seatReservationMapper.extendEndTime(userTicket.getUNo(), ticketMinutes);
            log.info("endtime이 현재보다 나중 (아직 사용중)", reservation);
        } else {
            // endTime이 현재보다 같거나 이전이다 (만료됨)
            seatReservationMapper.extendTimeFromNow(userTicket.getUNo(), ticketMinutes);
            log.info("endtime이 현재보다 같거나 이전 (만료됨)", reservation);
        }
        log.info("############ (\"############ 시간 추가 : {}", reservation);

        
        // user 정보 조회 
        Users user = userService.selectByNo(userTicket.getUNo());

        // ✅ 로그 추가
        String username = (user != null) ? user.getUsername() : "알 수 없음";

        String description = username + "님이 " +  "요금제 구매하였습니다.";
        logService.insertLogNoSeatId(user.getNo(), "이용권 구매", description);

        // 요금제 구매 처리
        return true;
    }
    
}
