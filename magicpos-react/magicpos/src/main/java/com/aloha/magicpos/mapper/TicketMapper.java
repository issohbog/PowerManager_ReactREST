package com.aloha.magicpos.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.Tickets;

@Mapper
public interface TicketMapper {
    // 전체 이용권 조회
    List<Tickets> findAll();

    // 특정 이용권 조회 (선택적)
    Tickets findById(@Param("no") Long no);
    
    // 티켓 번호로 티켓 정보 조회
    Tickets findByNo(@Param("no") Long no);
}
