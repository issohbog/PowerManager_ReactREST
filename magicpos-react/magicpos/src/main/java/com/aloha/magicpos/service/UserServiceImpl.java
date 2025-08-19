package com.aloha.magicpos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.magicpos.domain.Auths;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.mapper.UserMapper;
import com.aloha.magicpos.util.PasswordUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service("UserService")
public class UserServiceImpl implements UserService {

    @Autowired private UserMapper userMapper;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * 전체 회원수 조회 
     */
    @Override
    public int countUsers(String type, String keyword) {
        if (type == null || type.isBlank() || keyword == null || keyword.isBlank()){
            return userMapper.countAll();
        }
        return userMapper.countBy(type, keyword);
    }

    @Override
    public List<Users> selectAll(int index, int size) throws Exception {
        return userMapper.selectAll(index, size);
    }



    @Override
    public List<Users> searchUsers(String type, String keyword, int index, int size) {
        // 전체보기 (검색 조건 없을 때)
        if (keyword == null || keyword.isBlank() || type == null || type.isBlank()) {
            return userMapper.selectAll(index, size);
        }

        // 검색어 있을 경우 
        return userMapper.searchBy(type, keyword, index, size);
    }


    @Override
    public Users selectByNo(long no) throws Exception {  
        return userMapper.selectByNo(no);
    }

    @Override
    public Users findById(String id) throws Exception {
        return userMapper.findById(id);
    }

    @Override 
    public boolean isIdExist(String id) {
        return userMapper.findById(id) != null;
    }


    @Override
    public Users findByNo(Long userNo) {
        return userMapper.selectByNo(userNo);
    }


    //관리자용 회원가입
    @Override
    @Transactional
    public Users insert(Users user) throws Exception {          
        // 임시 비밀번호 생성 
        String tempPassword = PasswordUtil.generateTempPassword();

        // 비밀번호 암호화 
        String encoded = passwordEncoder.encode(tempPassword);
        user.setPassword(encoded);

        // 생성한 임시 비밀번호 반환
        user.setTempPassword(tempPassword);

        // DB에 저장 
        int result = userMapper.insert(user);

        if (result > 0) {
            Auths auth = new Auths();
            auth.setUNo(user.getNo());
            auth.setAuth("ROLE_USER");
            int authResult = userMapper.insertAuth(auth);

            if (authResult > 0) {
                log.info("권한 등록 성공");
            } else {
                log.warn("권한 등록 실패");
            }

        } else {
            log.error("사용자 등록 실패");
        }
        return user; 
    }

    // 사용자용 회원가입
    @Override
    @Transactional
    public Users insertByUser(Users user) throws Exception {
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // DB에 저장 
        int result = userMapper.insert(user);

        if (result > 0) {
            Auths auth = new Auths();
            auth.setUNo(user.getNo());
            auth.setAuth("ROLE_USER");
            int authResult = userMapper.insertAuth(auth);

            if (authResult > 0) {
                log.info("권한 등록 성공");
            } else {
                log.warn("권한 등록 실패");
            }

        } else {
            log.error("사용자 등록 실패");
        }
        return user; 
    }


    @Override
    public boolean update(Users user) throws Exception {
        return userMapper.update(user) > 0;
    }

    @Override
    public boolean resetPassword(long no, String defaultPassword) throws Exception {
        return userMapper.resetPassword(no, defaultPassword) > 0;
    }

    @Override
    public boolean updateUserProfile(Users user) throws Exception {
        return userMapper.updateUserProfile(user) > 0;
    }

    @Override
    public boolean delete(long no) throws Exception {
        return userMapper.delete(no) > 0;
    }

    @Override
    public List<Users> searchUsersByKeyword(String keyword) throws Exception {
        return userMapper.searchUsersByKeyword(keyword);
    }

    @Override
    public int join(Users user) throws Exception {
        // 🔒 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // 회원 등록 (자동으로 user.no 채워짐)
        int result = userMapper.join(user);

        if (result > 0) {
            // 방금 등록된 회원의 no(PK)를 기반으로 권한 등록
            Auths userAuth = new Auths();
            userAuth.setUNo(user.getNo());         // ✅ 핵심 변경: uNo 설정
            userAuth.setAuth("ROLE_USER");
            result = userMapper.insertAuth(userAuth);
        }

        return result;
    }

    @Override
    public boolean insertAuth(Auths auth) throws Exception {
        int result = userMapper.insertAuth(auth);
        return result > 0;
    }

    @Override
    public boolean login(Users user, HttpServletRequest request) {
        // 💍 토큰 생성
        String no = user.getUsername();
        String password = user.getPassword();
        UsernamePasswordAuthenticationToken token 
            = new UsernamePasswordAuthenticationToken(no, password);

        // 토큰을 이용하여 인증
        Authentication authentication = authenticationManager.authenticate(token);

        // 인증 여부 확인
        boolean result = authentication.isAuthenticated();

        // 인증에 성공하면 SecurityContext 에 설정
        if( result ) {
            SecurityContext securityContext = SecurityContextHolder.getContext();
            securityContext.setAuthentication(authentication);

            // 세션 인증 정보 설정 (세션이 없으면 새로 생성)
            HttpSession session = request.getSession(true); // 세션이 없으면 생성
            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
        }
        return result;   
    }

    @Override
    public Users select(String id) throws Exception {
        Users user = userMapper.select(id);
        return user;
    }

    @Override
    public boolean isAdmin() throws Exception {
        Authentication auth 
                = SecurityContextHolder.getContext().getAuthentication();
        if( auth == null || !auth.isAuthenticated() ) return false;

        return auth.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    // 권한 조회
    @Override
    public List<Auths> selectAuths(Long no) throws Exception {
        return userMapper.selectAuths(no);
    }

    // 아이디/비번 검증
    @Override
    public boolean isValid(String id, String rawPassword) throws Exception {
        Users user = userMapper.select(id); // XML <select id="select"> 사용
        if (user == null) return false;
        // 절대 평문 비교 금지: passwordEncoder.matches 사용
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }
    
}
