package com.aloha.magicpos.exception;

public class SeatUnavailableException extends RuntimeException {
    
    private final String code; // 예: "seatInUse"
    public SeatUnavailableException(String message) { this("seatInUse", message); }
    public SeatUnavailableException(String code, String message) { super(message); this.code = code; }
    public String code() { return code; }
}
