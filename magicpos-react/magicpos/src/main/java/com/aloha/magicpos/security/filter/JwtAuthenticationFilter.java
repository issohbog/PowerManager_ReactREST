package com.aloha.magicpos.security.filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.security.constants.SecurityConstants;
import com.aloha.magicpos.security.provider.JwtProvider;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;

    private static final ObjectMapper mapper = new ObjectMapper();

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager, JwtProvider jwtProvider) {
        this.authenticationManager = authenticationManager;
        this.jwtProvider = jwtProvider;
        setFilterProcessesUrl(SecurityConstants.LOGIN_URL); // ex) "/login"
    }

    /**
     * 로그인 시도
     * - form-urlencoded, multipart → getParameter()
     * - application/json → request body 파싱
     */
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        // 1) username/password 추출
        String contentType = request.getContentType();
        String username = null;
        String password = null;

        try {
            if (contentType != null && contentType.contains("application/json")) {
                // JSON 로그인
                Map<?, ?> body = mapper.readValue(request.getInputStream(), Map.class);
                Object u = body.get("username");
                Object p = body.get("password");
                username = u == null ? null : u.toString();
                password = p == null ? null : p.toString();
            } else {
                // 폼 로그인
                username = request.getParameter("username");
                password = request.getParameter("password");
            }
        } catch (IOException e) {
            throw new BadCredentialsException("Invalid login payload");
        }

        if (username == null || password == null) {
            throw new BadCredentialsException("Username or password missing");
        }

        log.info("Login attempt: username={}", username); // 비밀번호 로그 금지!

        // 2) Authentication 토큰 생성 & details 세팅
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, password);
        setDetails(request, authToken); // IP/세션 등 details

        // 3) 인증 요청
        return authenticationManager.authenticate(authToken);
    }

    /**
     * 인증 성공
     * - 헤더: Authorization: Bearer <jwt>
     * - 바디: { token, user }
     */
    @Override
    protected void successfulAuthentication(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain,
            Authentication authentication) throws IOException, ServletException {

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        Users user = customUser.getUser();

        List<String> roles = customUser.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String jwt = jwtProvider.createToken(user.getId(), user.getUsername(), roles);

        // 헤더에도 세팅
        response.addHeader("Authorization", SecurityConstants.TOKEN_PREFIX + jwt);

        // 응답 바디 (필요 필드만 DTO로)
        LoginSuccessDto body = new LoginSuccessDto(
                jwt,
                new UserDto(user.getNo(), user.getId(), user.getUsername(), user.getEmail(), roles)
        );

        response.setStatus(HttpServletResponse.SC_OK);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        try (PrintWriter out = response.getWriter()) {
            out.write(mapper.writeValueAsString(body));
            out.flush();
        }
    }

    /**
     * 인증 실패
     * - 통일된 JSON 에러 응답
     */
    @Override
    protected void unsuccessfulAuthentication(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException failed)
            throws IOException, ServletException {

        log.warn("Login failed: {}", failed.getMessage());

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        ErrorDto err = new ErrorDto("UNAUTHORIZED", "아이디 또는 비밀번호가 올바르지 않습니다.");
        try (PrintWriter out = response.getWriter()) {
            out.write(mapper.writeValueAsString(err));
            out.flush();
        }
    }

    /* ------------ DTOs ------------ */

    @Data
    @AllArgsConstructor
    static class LoginSuccessDto {
        private String token;
        private UserDto user;
    }

    @Data
    @AllArgsConstructor
    static class UserDto {
        private Long no;
        private String id;
        private String username;
        private String email;
        private List<String> roles;
    }

    @Data
    @AllArgsConstructor
    static class ErrorDto {
        private String code;
        private String message;
    }
}
