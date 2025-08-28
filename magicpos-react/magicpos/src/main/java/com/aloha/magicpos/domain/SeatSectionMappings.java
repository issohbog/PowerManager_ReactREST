package com.aloha.magicpos.domain;

import lombok.Data;

@Data
public class SeatSectionMappings {
    private Long no;                    // 매핑 고유번호(기본키)
    private Long sectionNo;             // 분단 번호
    private String seatId;              // 좌석 ID
    private Integer positionX;          // 좌석 X 좌표
    private Integer positionY;          // 좌석 Y 좌표

    // 조인용 필드들
    private String sectionName;         // 분단 이름 (seat_sections 조인)
    private Integer sectionOrder;       // 분단 순서 (seat_sections 조인)
    private String seatName;            // 좌석 이름 (seats 조인)
    private Long seatStatus;            // 좌석 상태 (seats 조인)

    // 생성자
    public SeatSectionMappings() {
        this.positionX = 0;
        this.positionY = 0;
    }

    public SeatSectionMappings(Long sectionNo, String seatId, Integer positionX, Integer positionY) {
        this.sectionNo = sectionNo;
        this.seatId = seatId;
        this.positionX = positionX;
        this.positionY = positionY;
    }
}
