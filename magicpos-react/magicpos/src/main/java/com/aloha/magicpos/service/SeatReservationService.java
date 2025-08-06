package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import com.aloha.magicpos.domain.SeatsReservations;

public interface SeatReservationService {
    Long getTotalUsedTime(Long userNo);

    // 사용자가 이미 이용중인 좌석이 있는지 확인
    public int countUsingSeatByUser(Long userNo) throws Exception;

    // 예약된 좌석 찾기 
    public Map<String, Object> findSeatReserveByUser(Long userNo) throws Exception;

    // 현재 이용중인 좌석 조회 
    public List<Map<String, Object>> findCurrentSeatUsage() throws Exception;

    

}
