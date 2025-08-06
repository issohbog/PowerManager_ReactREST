package com.aloha.magicpos.service;

import java.util.List;

import com.aloha.magicpos.domain.Auths;

public interface AuthService {
    // 사용자 번호로 권한 조회 (ex. 로그인 시)
    public List<Auths> selectByUserNo(Long uNo) throws Exception;

    // 권한 등록 (회원가입 시)
    public boolean insert(Auths auth) throws Exception;
}
