// src/main/java/com/aloha/magicpos/config/WebSocketConfig.java
package com.aloha.magicpos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");              // 브로커
        config.setApplicationDestinationPrefixes("/app"); // 클라 → 서버 보낼 prefix
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // 개발 단계: 로컬/사설IP 허용
                .setAllowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*", "http://192.168.*:*",
                                          "https://localhost:*", "https://127.0.0.1:*", "https://192.168.*:*");
    }
}
