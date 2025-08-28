package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

public interface ChatService {

    List<Map<String, Object>> findMacros();

    Map<String, Object> addMacro(String text_message);

    void deleteMacro(Long no);
}
