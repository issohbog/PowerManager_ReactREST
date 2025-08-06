package com.aloha.magicpos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.domain.Tickets;
import com.aloha.magicpos.mapper.TicketMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("TicketService")
public class TicketServiceImpl implements TicketService {
    
    @Autowired private TicketMapper ticketMapper;

    @Override
    public List<Tickets> findAll() throws Exception {
        return ticketMapper.findAll();
    }

    @Override
    public Tickets findById(Long no) throws Exception {
        return ticketMapper.findById(no);
    }

    @Override
    public Tickets findByNo(Long no) throws Exception {
        return ticketMapper.findByNo(no);
    }

}
