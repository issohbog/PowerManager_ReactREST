package com.aloha.magicpos.domain;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Orders {
    private Long no;
    private Long uNo;
    private String seatId;
    private Long totalPrice;
    private Timestamp orderTime;
    private String payment;
    private String message;
    private Long orderStatus;
    private Long paymentStatus;
    private LocalDateTime payAt;
    private Long cashAmount;
}
