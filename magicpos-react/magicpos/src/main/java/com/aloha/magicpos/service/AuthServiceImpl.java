package com.aloha.magicpos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.domain.Auths;
import com.aloha.magicpos.mapper.AuthMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("AuthService")
public class AuthServiceImpl implements AuthService {

    @Autowired AuthMapper authMapper;

    @Override
    public List<Auths> selectByUserNo(Long uNo) throws Exception {
        return authMapper.selectByUserNo(uNo);
    }

    @Override
    public boolean insert(Auths auth) throws Exception {
        log.info("🛠 authService.insert() 호출됨 - uNo: {}, 권한: {}", auth.getUNo(), auth.getAuth());
        return authMapper.insert(auth) > 0;
    }
    
}
