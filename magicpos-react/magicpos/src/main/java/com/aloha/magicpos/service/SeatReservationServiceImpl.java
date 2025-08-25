package com.aloha.magicpos.service;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.magicpos.domain.SeatsReservations;
import com.aloha.magicpos.domain.event.SeatReservedEvent;
import com.aloha.magicpos.exception.SeatUnavailableException;
import com.aloha.magicpos.mapper.SeatReservationMapper;
import com.aloha.magicpos.mapper.SeatMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SeatReservationServiceImpl implements SeatReservationService {

    private final SeatReservationMapper seatReservationMapper;

    private final UserTicketService userTicketService;

    private final SeatMapper seatMapper;

    private final ApplicationEventPublisher applicationEventPublisher;

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

    /**
     * 좌석 예약 
     */
    @Override
    @Transactional
    public void reserve(Long userNo, String seatId, int remainingTime, String username) throws Exception {
            
            // 사용자가 입력한 좌석 ID가 유효한지 확인
            int seatStatus = seatMapper.getSeatStatus(seatId);
            if (seatStatus == 1 || seatStatus == 2) {
                throw new SeatUnavailableException("이미 사용 중이거나 고장난 좌석입니다.");
            }

            LocalDateTime startTime = LocalDateTime.now();
            LocalDateTime endTime = startTime.plusMinutes(remainingTime);

            seatMapper.insertSeatReservation(userNo, seatId, startTime, endTime);
            seatMapper.updateSeatStatusToInUse(seatId);

            // // ✅ 좌석 예약 로그 (좌석ID 포함) → 관리자 로그 스트림(/topic/admin/logs)
            // logService.insertLog(
            //     userNo,
            //     seatId,
            //     "좌석예약",
            //     username + "님이 " + seatId + " 사용을 시작했습니다. (잔여 " + remainingTime + "분)"
            // );

            applicationEventPublisher.publishEvent(new SeatReservedEvent(userNo, seatId, remainingTime, username));
    }

    /**
     * 특정 좌석의 당일 이용 내역 조회
     * (좌석 현황 마우스 우클릭 시 당일 내역 조회 용)
     */
    @Override
    public List<Map<String, Object>> findTodayReservationsBySeatId(String seatId) throws Exception {
        return seatReservationMapper.findTodayReservationsBySeatId(seatId);
    }


}   