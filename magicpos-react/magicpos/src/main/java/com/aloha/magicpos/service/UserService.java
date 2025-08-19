package com.aloha.magicpos.service;

import java.util.List;

import com.aloha.magicpos.domain.Auths;
import com.aloha.magicpos.domain.Users;

import jakarta.servlet.http.HttpServletRequest;

public interface UserService {
    // 회원 전체 조회
    public List<Users> selectAll(int index, int size) throws Exception;

    // 전체 회원 수 
    public int countUsers(String type, String keyword);

    // 조건 별 회원 조회(아이디, 이름, 전화번호로 검색)
    public List<Users> searchUsers(String type, String keyword, int index, int size);

    // 단일 회원 조회 (번호 기준)
    public Users selectByNo(long no) throws Exception;

    // 아이디로 회원 조회
    public Users findById(String id) throws Exception;

    // 아이디 중복체크
    public boolean isIdExist(String id);

    // userNo로 회원 조회 
    public Users findByNo(Long userNo);

    // 회원 가입(회원등록- 관리자용)
    public Users insert(Users user) throws Exception;

    // 회원 가입(사용자용)
    public Users insertByUser(Users user) throws Exception;

    // 회원 권한 등록
    public boolean insertAuth(Auths auth) throws Exception;

    // 관리자용 회원 정보 수정
    public boolean update(Users user) throws Exception;

    // 관리자용 비밀번호 초기화
    public boolean resetPassword(long no, String defaultPassword) throws Exception;

    // 사용자용 회원 정보 수정
    public boolean updateUserProfile(Users user) throws Exception;

    // 회원 탈퇴
    public boolean delete(long no) throws Exception;

    // 회원 검색 (이름 / 아이디 / 전화번호)
    public List<Users> searchUsersByKeyword(String keyword) throws Exception;

    // ---선생님 코드----
    // 회원 가입
    public int join(Users user) throws Exception;
    
    // 회원 권한 등록
    // public int insertAuth(Auths userAuth) throws Exception;

    // 🔐 로그인
    public boolean login(Users user, HttpServletRequest request);

    // 회원 조회
    public Users select(String id) throws Exception;

    // 👮‍♀️ 관리자 확인
    public boolean isAdmin() throws Exception;

    // 권한 조회
    public List<Auths> selectAuths(Long no) throws Exception;

    // 아이디/비번 검증
    public boolean isValid(String usernameOrId, String rawPassword) throws Exception;

}
