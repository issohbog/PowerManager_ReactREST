package com.aloha.magicpos.domain;

import lombok.Data;

@Data
public class ChatMessage {
    private String id;
    private String channel;
    private String from;
    private String text;
    private long at;
}
