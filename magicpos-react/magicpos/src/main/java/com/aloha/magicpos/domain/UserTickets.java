package com.aloha.magicpos.domain;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UserTickets {
    private Long no;

    @JsonProperty("uNo")
    private Long uNo;

    @JsonProperty("tNo")
    private Long tNo;

    private Long remainTime;
    private Timestamp payAt;
    private String payment;

}
