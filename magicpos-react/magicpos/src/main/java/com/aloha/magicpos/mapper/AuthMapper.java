package com.aloha.magicpos.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.magicpos.domain.Auths;

@Mapper
public interface AuthMapper {
    // 사용자 번호로 권한 조회 (ex. 로그인 시)
    List<Auths> selectByUserNo(Long uNo);

    // 권한 등록 (회원가입 시)
    int insert(Auths auth);
}
