package com.aloha.magicpos.domain.event;

public record SeatReservedEvent(
    Long userNo,
    String seatId,
    int remainingTime,
    String username
) {}
