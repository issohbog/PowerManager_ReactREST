package com.aloha.magicpos.service;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.domain.SeatsReservations;
import com.aloha.magicpos.mapper.SeatReservationMapper;

@Service
public class SeatReservationServiceImpl implements SeatReservationService {

    @Autowired
    SeatReservationMapper seatReservationMapper;

    @Autowired  
    UserTicketService userTicketService;

    @Override
    public Long getTotalUsedTime(Long userNo) {
        return seatReservationMapper.getTotalUsedTime(userNo);
    }


    @Override
    public int countUsingSeatByUser(Long userNo) throws Exception   {
        return seatReservationMapper.countUsingSeatByUser(userNo);
    }

    @Override
    public Map<String, Object> findSeatReserveByUser(Long userNo) throws Exception {

        Map<String, Object> info = new HashMap<>();

        // 유저의 가장 최근 예약 정보 가져오기 
        SeatsReservations reservation = seatReservationMapper.findCurrentReservationByUser(userNo);

        if (reservation != null) {
            String seatId = reservation.getSeatId();
            Timestamp startTs = reservation.getStartTime();
            Timestamp endTs = reservation.getEndTime();

            LocalDateTime start = startTs.toLocalDateTime();
            LocalDateTime end = endTs.toLocalDateTime();
            LocalDateTime now = LocalDateTime.now();


            long usedSeconds = Duration.between(start, now).getSeconds();
            long remainSeconds = Duration.between(now, end).getSeconds();

            String username = reservation.getUsername();

            info.put("seat_id", seatId);
            info.put("start_time", start); 
            info.put("end_time", end);
            info.put("used_time", usedSeconds);
            info.put("remain_time", remainSeconds);
            info.put("user_no", userNo);
            info.put("username", username);
        } else {
            // 사용 중인 좌석 없으면 기본값
            info.put("seat_id", "");
            info.put("start_time", null);
            info.put("end_time", null);
            info.put("used_time", 0);
            info.put("remain_time", 0);
        }
        
        return info;

    }

    /**
     * 반환값 (프론트에서 currentUsage로 꺼내쓸수 있음)
    * [
    {
        "seat_id": "S8",
        "username": "홍길동",
        "start_time": "2025-07-17T10:00:00",
        "end_time": "2025-07-17T12:00:00",
        "remain_time": "01:12"
    },
    ...
    ]
     */
    @Override
    public List<Map<String, Object>> findCurrentSeatUsage() throws Exception {
            List<Map<String, Object>> list = seatReservationMapper.findCurrentSeatUsage();
        LocalDateTime now = LocalDateTime.now();

    for (Map<String, Object> map : list) {
        Timestamp endTime = (Timestamp) map.get("end_time");

        if (endTime != null) {
            LocalDateTime end = endTime.toLocalDateTime();
            long remainMinutes = Duration.between(now, end).toMinutes();
            
            // 음수 방지
            if (remainMinutes < 0) remainMinutes = 0;

            map.put("remain_time", remainMinutes);  // key는 프론트에서 쓸 이름으로, 
        } else {
            map.put("remain_time", "00:00");
        }
    }

    return list;

    }


}   