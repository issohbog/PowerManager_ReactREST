package com.aloha.magicpos.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.magicpos.domain.Chats;
import com.aloha.magicpos.mapper.ChatMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatMapper chatMapper;

    @Override
    public List<Map<String, Object>> findMacros() {
        List<Map<String, Object>> rows = chatMapper.findMacros();
        return rows.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("no", row.get("no")); // 그대로
            m.put("text_message", row.get("text_message")); 
            return m;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> addMacro(String text_message) {
        Chats macro = new Chats();
        macro.setText_message(text_message);

        int affected = chatMapper.insertMacro(macro);
        if (affected <= 0) {
            throw new IllegalStateException("매크로 추가에 실패했습니다.");
        }

        Map<String, Object> out = new HashMap<>();
        out.put("no", macro.getNo());
        out.put("text_message", macro.getText_message());
        return out;
    }

    @Override
    @Transactional
    public void deleteMacro(Long no) {
        int affected = chatMapper.deleteMacro(no);
        if (affected <= 0) {
            throw new IllegalStateException("삭제 대상이 없거나 실패했습니다. no=" + no);
        }
    }
}
