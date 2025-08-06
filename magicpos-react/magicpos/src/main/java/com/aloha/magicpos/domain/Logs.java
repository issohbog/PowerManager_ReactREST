package com.aloha.magicpos.domain;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class Logs {
    private Long no;
    private Long uNo;
    private String seatId;
    private String actionType;
    private String description;
    private Timestamp createdAt;
}
