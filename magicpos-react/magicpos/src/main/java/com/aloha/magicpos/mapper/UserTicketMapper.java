package com.aloha.magicpos.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.UserTickets;

@Mapper
public interface UserTicketMapper {
    
    // 이용권 등록 (결제 시 호출)
    int insert(UserTickets userTicket);

    // 전체 이용권 내역 조회 (관리자용)
    List<UserTickets> selectAll();

    // 특정 사용자 이용권 내역 조회
    List<UserTickets> findByUserNo(@Param("uNo") long uNo);

    // 특정 사용자 최근 남은 시간 조회
    Integer findRemainTimeByUserNo(@Param("uNo") long uNo);

    // 특정 사용자 남은 시간 조회(모든 이용권 합산)
    Long subRemainTimeByUser(Long userNo);

    // 특정 사용자 최근 이용권 조회
    Long findLatestTicketNoByUserNo(@Param("uNo") Long uNo);

    // 사용자가 가진 user_tickets 중 남은 시간이 0보다 큰 것만 오래된 순서로 조회
    List<UserTickets> findUserTicketsOrderByOldest(@Param("userNo") Long userNo);

    // 특정 티켓의 remain_time 값을 원하는 값으로 갱신
    int updateRemainTime(@Param("no") Long no, @Param("remainTime") Long remainTime);
}
