package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.mapper.TodayHistoryMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("TodayHistoryService")
public class TodayHistoryServiceImpl implements TodayHistoryService {

    @Autowired private TodayHistoryMapper todayHistoryMapper;

    @Override
    public List<Map<String, Object>> findTodayAll(int index, int size) throws Exception {
        return todayHistoryMapper.findTodayAll(index, size);
    }


    @Override
    public List<Map<String, Object>> findTodayOrdersOnly(int index, int size) throws Exception {
        return todayHistoryMapper.findTodayOrdersOnly(index, size);
    }


    @Override
    public List<Map<String, Object>> findTodayTicketsOnly(int index, int size) throws Exception {
        return todayHistoryMapper.findTodayTicketsOnly(index, size);
    }

    @Override
    public List<Map<String, Object>> searchTodayAll(String keyword, int index, int size) throws Exception {
        return todayHistoryMapper.searchTodayAll(keyword, index, size);
    }

    @Override
    public List<Map<String, Object>> searchTodayOrders(String keyword, int index, int size) throws Exception {
        return todayHistoryMapper.searchTodayOrders(keyword, index, size);
    }

    @Override
    public List<Map<String, Object>> searchTodayTickets(String keyword, int index, int size) throws Exception {
        return todayHistoryMapper.searchTodayTickets(keyword, index, size);
    }
    
    @Override
    public long countTodayAll() throws Exception {
        return todayHistoryMapper.countTodayAll();
    }
    @Override
    public long countSearchTodayAll(String keyword) throws Exception {
        return todayHistoryMapper.countSearchTodayAll(keyword);
    }
    @Override
    public long countTodayOrders(String keyword) throws Exception {
        return todayHistoryMapper.countTodayOrders(keyword);
    }
    @Override
    public long countTodayTickets(String keyword) throws Exception {
        return todayHistoryMapper.countTodayTickets(keyword);
    }
}
