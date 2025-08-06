package com.aloha.magicpos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.aloha.magicpos.domain.Tickets;
import com.aloha.magicpos.service.TicketService;

@Controller
@RequestMapping("/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // ✅ 전체 이용권 목록
    @GetMapping
    public String list(Model model) throws Exception {
        List<Tickets> tickets = ticketService.findAll();
        model.addAttribute("tickets", tickets);
        return "ticket/list"; // => /templates/ticket/list.html
    }

    // ✅ 단일 이용권 상세보기 (선택적)
    @GetMapping("/{no}")
    public String view(@PathVariable Long no, Model model) throws Exception {
        Tickets ticket = ticketService.findById(no);
        model.addAttribute("ticket", ticket);
        return "ticket/view"; // => /templates/ticket/view.html
    }
}
