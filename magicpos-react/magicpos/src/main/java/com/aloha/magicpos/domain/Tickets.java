package com.aloha.magicpos.domain;

import lombok.Data;

@Data
public class Tickets {
    private Long no;
    private String ticketName;
    private Long time;
    private Long price;
}
