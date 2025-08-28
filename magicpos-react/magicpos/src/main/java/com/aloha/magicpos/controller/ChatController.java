package com.aloha.magicpos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.aloha.magicpos.service.ChatService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/chat/macros") // ✅ 기본 경로
@RequiredArgsConstructor
public class ChatController {

    @Autowired
    private ChatService chatService; // ✅ 생성자 주입

    // 목록: GET /api/chat/macros
    @GetMapping
    public List<Map<String, Object>> list() {
        // 서비스에서 [{no, text_message}, ...] 형태로 반환하도록 수정
        return chatService.findMacros(); // [{no, text_message}, ...]
    }

    // 추가: POST /api/chat/macros
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> add(@RequestBody AddMacroRequest body) {
        if (body == null || body.getText_message() == null || body.getText_message().trim().isEmpty()) {
            throw new IllegalArgumentException("text_message is required");
        }
        // 서비스에서 {no, text_message} 형태로 반환하도록 수정
        return chatService.addMacro(body.getText_message());
    }

    // 삭제: DELETE /api/chat/macros/{id}
    @DeleteMapping("/{no}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("no") Long no) {
        chatService.deleteMacro(no);
    }

    @Data
    public static class AddMacroRequest {
        private String text_message;
    }
}
