package com.aloha.magicpos.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.Auths;
import com.aloha.magicpos.domain.Users;

@Mapper
public interface UserMapper {
    // 전체 회원 수 
    int countAll();

    // 검색 조건을 만족하는 회원 수 
    int countBy(@Param("type") String type, @Param("keyword") String keyword);

    // 회원 전체 조회
    List<Users> selectAll(@Param("index") int index, @Param("size") int size);

    // 회원 조회시 검색기능
    List<Users> searchBy(@Param("type") String type, @Param("keyword") String keyword, @Param("index") int index, @Param("size") int size);

    // 단일 회원 조회 (번호 기준)
    Users selectByNo(@Param("no") long no);

    // 아이디로 회원 조회 - 아이디 중복체크시 사용
    Users findById(@Param("id") String id);

    // userNo로 회원 조회 
    Users findByNo(Long userNo);

    // 회원 등록
    int insert(Users user) throws Exception;

    // 회원 권한 등록
    int insertAuth(Auths auth) throws Exception;

    // 관리자용 회원 정보 수정
    int update(Users user);

    // 관리자용 비밀번호 초기화
    int resetPassword(@Param("no") long no, @Param("password") String password);

    // 사용자용 회원 정보 수정
    int updateUserProfile(Users user);

    // 회원 탈퇴
    int delete(@Param("no") long no);

    // 회원 검색 (이름 / 아이디 / 전화번호)
    List<Users> searchUsersByKeyword(@Param("keyword") String keyword);

    // --- 선생님 코드 ---
    // 회원 가입
    public int join(Users user) throws Exception;
    
    // 회원 권한 등록
    // public int insertAuth(Auths userAuth) throws Exception;

    // 회원 조회
    public Users select(@Param("id") String id) throws Exception;

    // 권한 조회
    public List<Auths> selectAuths(@Param("no") Long no) throws Exception;

}
