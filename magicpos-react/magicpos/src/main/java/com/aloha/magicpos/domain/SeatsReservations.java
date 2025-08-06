package com.aloha.magicpos.domain;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class SeatsReservations {
    private Long no;
    private String seatId;
    private Long uNo;
    private Timestamp startTime;
    private Timestamp endTime;

    // 좌석 이용 시간 조회 사용자용 - 사용자 이름 
    private String username;
}
