package com.aloha.magicpos.domain.event;

public record TimeAddedEvent(
    String seatId,
    String username, 
    long newRemainTime
) {}
