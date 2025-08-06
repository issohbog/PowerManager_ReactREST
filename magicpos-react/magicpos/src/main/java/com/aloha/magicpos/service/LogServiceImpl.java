package com.aloha.magicpos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.mapper.LogMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("LogService")
public class LogServiceImpl implements LogService{
    @Autowired
    private LogMapper logMapper;

    // 로그 삽입
    @Override
    public void insertLog(Long uNo, String seatId, String actionType, String description) {
        logMapper.insertLog(uNo, seatId, actionType, description);
    }

    // 로그 삽입 seat_id : X
    @Override
    public void insertLogNoSeatId(Long uNo, String actionType, String description) {
        logMapper.insertLogNoSeatId(uNo, actionType, description);
    }
    

    // 🔍 검색 포함 (페이지네이션)
    @Override
    public List<Map<String, Object>> searchLoginLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception {
        return logMapper.searchLoginLogsByDate(startDate, endDate, keyword, index, size);
    }
    @Override
    public List<Map<String, Object>> searchJoinLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception {
        return logMapper.searchJoinLogsByDate(startDate, endDate, keyword, index, size);
    }
    @Override
    public List<Map<String, Object>> searchTicketLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception {
        return logMapper.searchTicketLogsByDate(startDate, endDate, keyword, index, size);
    }
    @Override
    public List<Map<String, Object>> searchProductLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception {
        return logMapper.searchProductLogsByDate(startDate, endDate, keyword, index, size);
    }
    @Override
    public List<Map<String, Object>> searchAllLogsByDate(String startDate, String endDate, String keyword, int index, int size) throws Exception {
        return logMapper.searchAllLogsByDate(startDate, endDate, keyword, index, size);
    }

    // 📄 검색 없이 (페이지네이션)
    @Override
    public List<Map<String, Object>> findLogsByDate(String startDate, String endDate, int index, int size) throws Exception {
        return logMapper.findLogsByDate(startDate, endDate, index, size);
    }
    @Override
    public long countLogsByDate(String startDate, String endDate) throws Exception {
        return logMapper.countLogsByDate(startDate, endDate);
    }
    @Override
    public List<Map<String, Object>> findLoginLogsByDate(String startDate, String endDate, int index, int size) throws Exception {
        return logMapper.findLoginLogsByDate(startDate, endDate, index, size);
    }
    @Override
    public long countLoginLogsByDate(String startDate, String endDate) throws Exception {
        return logMapper.countLoginLogsByDate(startDate, endDate);
    }
    @Override
    public List<Map<String, Object>> findJoinLogsByDate(String startDate, String endDate, int index, int size) throws Exception {
        return logMapper.findJoinLogsByDate(startDate, endDate, index, size);
    }
    @Override
    public long countJoinLogsByDate(String startDate, String endDate) throws Exception {
        return logMapper.countJoinLogsByDate(startDate, endDate);
    }
    @Override
    public List<Map<String, Object>> findTicketLogsByDate(String startDate, String endDate, int index, int size) throws Exception {
        return logMapper.findTicketLogsByDate(startDate, endDate, index, size);
    }
    @Override
    public long countTicketLogsByDate(String startDate, String endDate) throws Exception {
        return logMapper.countTicketLogsByDate(startDate, endDate);
    }
    @Override
    public List<Map<String, Object>> findProductLogsByDate(String startDate, String endDate, int index, int size) throws Exception {
        return logMapper.findProductLogsByDate(startDate, endDate, index, size);
    }
    @Override
    public long countProductLogsByDate(String startDate, String endDate) throws Exception {
        return logMapper.countProductLogsByDate(startDate, endDate);
    }

    // 🔍 검색 포함 (페이지네이션)
    @Override
    public long countSearchLoginLogsByDate(String startDate, String endDate, String keyword) throws Exception {
        return logMapper.countSearchLoginLogsByDate(startDate, endDate, keyword);
    }
    @Override
    public long countSearchJoinLogsByDate(String startDate, String endDate, String keyword) throws Exception {
        return logMapper.countSearchJoinLogsByDate(startDate, endDate, keyword);
    }
    @Override
    public long countSearchTicketLogsByDate(String startDate, String endDate, String keyword) throws Exception {
        return logMapper.countSearchTicketLogsByDate(startDate, endDate, keyword);
    }
    @Override
    public long countSearchProductLogsByDate(String startDate, String endDate, String keyword) throws Exception {
        return logMapper.countSearchProductLogsByDate(startDate, endDate, keyword);
    }
    @Override
    public long countSearchAllLogsByDate(String startDate, String endDate, String keyword) throws Exception {
        return logMapper.countSearchAllLogsByDate(startDate, endDate, keyword);
    }


}
