package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import com.aloha.magicpos.domain.Seats;

public interface SeatService {
    // 전체 좌석 조회
    public List<Seats> findAll() throws Exception;

    // 전체 좌석 조회 (좌석 데시보드 용 - 사용자 정보, 남은시간 도 조회)
    List<Seats> findAllSeatWithUsage() throws Exception;

    // 사용중인 좌석 개수 조회 
    public int countUsingSeats() throws Exception;

    // 전체 좌석 개수 조회 
    public int countAllSeats() throws Exception;

    // 좌석 구간별 분리 
    Map<String, List<Seats>> getSeatSections() throws Exception;

    // 단일 좌석 조회
    public Seats findById(String seatId) throws Exception;

    // 좌석 상태 업데이트
    public boolean updateStatus(String seatId, String seatStatus) throws Exception;

    // 좌석 상태 업데이트 (청소중 -> 이용가능)
    public boolean clearSeat(String seatId) throws Exception;

    // 좌석 사용 정보 조회 (사용자, 남은 시간 등) throws Exception
    public Map<String, Object> findSeatUsageInfo(String seatId) throws Exception;

    // 로그인한 유저 기준 좌석 사용 정보 조회
    public Map<String, Object> findSeatUsageInfoByUser(Long userNo) throws Exception;

    // 예약된 좌석ID만 반환
    List<String> findReservedSeatIds();

    // 예약되지 않은 좌석ID만 반환
    List<String> findAvailableSeatIds();

    // 사용회원 검색
    List<Map<String, Object>> searchActiveUsers(String keyword);

    // 좌석 상태 조회
    public int getSeatStatus(String seatId) throws Exception;

}
