package com.aloha.magicpos.domain;

import lombok.Data;

@Data
public class Seats {
    private String seatId;
    private String seatName;
    private Long seatStatus;

    // 좌석현황 데시보드 조회 용(users 테이블 컬럼)
    private String username;

    // 좌석현황 데시보드 조회 용(user-tickets 테이블 컬럼)
    private Long remainTime; 

    // 좌석현황 데시보드 좌석 색깔 구분용(db에 없음)
    private String className;
}
