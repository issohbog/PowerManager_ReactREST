package com.aloha.magicpos.domain;

import lombok.Data;

@Data
public class SeatSections {
    private Long no;                    // 분단 고유번호(기본키)
    private String sectionName;         // 분단 이름(예: TOP, MIDDLE, BOTTOM)
    private Integer sectionOrder;       // 분단 순서(화면 표시 순서)
    private Integer minX;               // 분단 최소 X 좌표
    private Integer minY;               // 분단 최소 Y 좌표
    private Integer maxX;               // 분단 최대 X 좌표
    private Integer maxY;               // 분단 최대 Y 좌표
    private Boolean isActive;           // 분단 활성화 여부

    // 생성자
    public SeatSections() {
        this.isActive = true;
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }

    public SeatSections(String sectionName, Integer sectionOrder) {
        this();
        this.sectionName = sectionName;
        this.sectionOrder = sectionOrder;
    }
}
