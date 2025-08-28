package com.aloha.magicpos.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.aloha.magicpos.domain.ChatMessage;

@Controller
@RequiredArgsConstructor
public class ChatChannelController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{channel}")  // 클라: /app/chat/{channel} 로 publish
    public void relay(@DestinationVariable("channel") String channel, @Payload ChatMessage message) {
        // 동적 토픽으로 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + channel, message);
    }
}
