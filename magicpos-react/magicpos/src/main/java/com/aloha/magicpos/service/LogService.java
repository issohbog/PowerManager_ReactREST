package com.aloha.magicpos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;


public interface LogService {

    // ✅ 로그 삽입
    public void insertLog(Long uNo, String seatId, String actionType, String description);

    // 로그 삽입(seatid 없는 경우 )
    public void insertLogNoSeatId(Long uNo, String actionType, String description);

    // 🔍 검색 포함 (페이지네이션)
    List<Map<String, Object>> searchLoginLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception;
    long countSearchLoginLogsByDate(String startDate, String endDate, String keyword) throws Exception;

    List<Map<String, Object>> searchJoinLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception;
    long countSearchJoinLogsByDate(String startDate, String endDate, String keyword) throws Exception;

    List<Map<String, Object>> searchTicketLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception;
    long countSearchTicketLogsByDate(String startDate, String endDate, String keyword) throws Exception;

    List<Map<String, Object>> searchProductLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception;
    long countSearchProductLogsByDate(String startDate, String endDate, String keyword) throws Exception;

    List<Map<String, Object>> searchAllLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception;
    long countSearchAllLogsByDate(String startDate, String endDate, String keyword) throws Exception;

    // 📄 검색 없이 (페이지네이션)
    List<Map<String, Object>> findLogsByDate(String startDate, String endDate, int index, int size) throws Exception;
    long countLogsByDate(String startDate, String endDate) throws Exception;

    List<Map<String, Object>> findLoginLogsByDate(String startDate, String endDate, int index, int size) throws Exception;
    long countLoginLogsByDate(String startDate, String endDate) throws Exception;

    List<Map<String, Object>> findJoinLogsByDate(String startDate, String endDate, int index, int size) throws Exception;
    long countJoinLogsByDate(String startDate, String endDate) throws Exception;

    List<Map<String, Object>> findTicketLogsByDate(String startDate, String endDate, int index, int size) throws Exception;
    long countTicketLogsByDate(String startDate, String endDate) throws Exception;

    List<Map<String, Object>> findProductLogsByDate(String startDate, String endDate, int index, int size) throws Exception;
    long countProductLogsByDate(String startDate, String endDate) throws Exception;


}
