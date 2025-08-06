package com.aloha.magicpos.service;

import java.util.List;

import com.aloha.magicpos.domain.Tickets;

public interface TicketService {
    // 전체 이용권 조회
    public List<Tickets> findAll() throws Exception;

    // 특정 이용권 조회 (선택적)
    public Tickets findById(Long no) throws Exception;
    
    // 티켓 번호로 티켓 정보 조회
    public Tickets findByNo(Long no) throws Exception;
} 