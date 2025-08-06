package com.aloha.magicpos.mapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LogMapper {

    void insertLog(
    @Param("uNo") Long uNo,
    @Param("seatId") String seatId,
    @Param("actionType") String actionType,
    @Param("description") String description
    );

    void insertLogNoSeatId(
        @Param("uNo") Long uNo,
        @Param("actionType") String actionType,
        @Param("description") String description
    );

    // 🔍 검색 포함 (페이지네이션)
    List<Map<String, Object>> searchLoginLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);
    long countSearchLoginLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword);

    List<Map<String, Object>> searchJoinLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);
    long countSearchJoinLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword);

    List<Map<String, Object>> searchTicketLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);
    long countSearchTicketLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword);

    List<Map<String, Object>> searchProductLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);
    long countSearchProductLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword);

    List<Map<String, Object>> searchAllLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);
    long countSearchAllLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("keyword") String keyword);

    // 📄 검색 없이 (페이지네이션)
    List<Map<String, Object>> findLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("index") int index, @Param("size") int size);
    long countLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate);

    List<Map<String, Object>> findLoginLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("index") int index, @Param("size") int size);
    long countLoginLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate);

    List<Map<String, Object>> findJoinLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("index") int index, @Param("size") int size);
    long countJoinLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate);

    List<Map<String, Object>> findTicketLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("index") int index, @Param("size") int size);
    long countTicketLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate);

    List<Map<String, Object>> findProductLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate, @Param("index") int index, @Param("size") int size);
    long countProductLogsByDate(@Param("startDate") String startDate, @Param("endDate") String endDate);
}
