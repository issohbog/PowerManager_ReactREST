package com.aloha.magicpos.mapper;

import org.apache.ibatis.annotations.*;

import com.aloha.magicpos.domain.Chats;

import java.util.List;
import java.util.Map;

@Mapper
public interface ChatMapper {

    List<Map<String, Object>> findMacros();

    int insertMacro(Chats chat); 
    int deleteMacro(Long no);
}
