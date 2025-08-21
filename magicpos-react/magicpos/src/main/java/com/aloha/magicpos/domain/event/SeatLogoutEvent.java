package com.aloha.magicpos.domain.event;

public record SeatLogoutEvent(
    Long userNo,
    String seatId,
    String username
) {}
