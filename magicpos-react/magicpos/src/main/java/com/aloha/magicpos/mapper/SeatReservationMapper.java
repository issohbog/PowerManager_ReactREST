package com.aloha.magicpos.mapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.SeatsReservations;

@Mapper
public interface SeatReservationMapper {
    Long getTotalUsedTime(Long userNo);
    
    // 좌석 예약 정보 저장
    // void insertSeatReservation(
    //     @Param("seatId") String seatId,
    //     @Param("userNo") Long userNo,
    //     @Param("startTime") java.sql.Timestamp startTime,
    //     @Param("endTime") java.sql.Timestamp endTime
    // );

    int countUsingSeatByUser(Long userNo);

    // 유저의 가장 최근 예약 정보 가져오기
    SeatsReservations findCurrentReservationByUser(Long userNo);

    // 현재 이용중인 좌석 조회(관리자용)
    List<Map<String, Object>> findCurrentSeatUsage();

    // 로그아웃 할 회원의 endtime을 현재시간으로 갱신
    int updateEndTime(@Param("uNo") Long uNo, @Param("now") LocalDateTime now); 

    // 기존 end_time 에 ticket 시간만큼 추가
    int extendEndTime(@Param("userNo") Long userNo, @Param("minutes") long minutes);

    // 현재시각 에 ticket 시간만큼 추가
    int extendTimeFromNow(@Param("userNo") Long userNo, @Param("minutes") long minutes);

    // 서버 시작 전 비정상 완료된 좌석 userNo 추출 
    List<Long> findLoggedInUserNosFromSeatStatus();

    // 특정 좌석의 당일 이용 내역 조회 (좌석 현황 마우스 우클릭 시 당일 내역 조회 용)
    List<Map<String, Object>> findTodayReservationsBySeatId(@Param("seatId") String seatId);

} 