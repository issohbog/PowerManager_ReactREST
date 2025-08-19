package com.aloha.magicpos.security.provider;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.aloha.magicpos.domain.Auths;
import com.aloha.magicpos.domain.CustomUser;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.mapper.UserMapper;
import com.aloha.magicpos.security.constants.SecurityConstants;
import com.aloha.magicpos.security.props.JwtProps;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

/**
 * 💍 JWT 토큰 관련 유틸
 *  - 생성 / 파싱 / 검증
 */
@Slf4j
@Component
public class JwtProvider {

    @Autowired
    private JwtProps jwtProps;

    @Autowired
    private UserMapper userMapper;

    /**
     * 토큰 생성
     */
    public String createToken(String id, String username, List<String> roles) {
        SecretKey shaKey = getShaKey();
        int expMillis = 1000 * 60 * 60 * 24 * 5; // 5일

        return Jwts.builder()
                .signWith(shaKey, Jwts.SIG.HS512)
                .header()
                    .add("typ", SecurityConstants.TOKEN_TYPE)
                .and()
                .expiration(new Date(System.currentTimeMillis() + expMillis))
                .claim("id", id)
                .claim("username", username)
                .claim("rol", roles == null ? Collections.emptyList() : roles)
                .compact();
    }

    /**
     * Authorization 헤더 → Authentication 토큰
     */
    public UsernamePasswordAuthenticationToken getAuthenticationToken(String authorization) {
        if (authorization == null || authorization.isBlank()) return null;

        try {
            String jwt = extractJwt(authorization);
            if (jwt.isBlank()) return null;

            SecretKey shaKey = getShaKey();

            // 💍 파싱
            Jws<Claims> parsedToken = Jwts.parser()
                    .verifyWith(shaKey)
                    .build()
                    .parseSignedClaims(jwt);

            Claims payload = parsedToken.getPayload();

            String id = Objects.toString(payload.get("id"), null);
            String username = Objects.toString(payload.get("username"), null);

            Object rolesClaim = payload.get("rol");
            List<String> roleStrings = normalizeRoles(rolesClaim);

            // 권한 목록
            List<SimpleGrantedAuthority> authorities = roleStrings.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            // 기본 Users 객체
            Users user = new Users();
            user.setId(id);
            user.setUsername(username);

            // 추가 유저 정보(DB)
            try {
                Users userInfo = userMapper.select(id);
                if (userInfo != null) {
                    user.setNo(userInfo.getNo());
                    user.setUsername(userInfo.getUsername());
                    user.setEmail(userInfo.getEmail());
                    user.setEnabled(userInfo.getEnabled());
                }
            } catch (Exception e) {
                log.error("토큰 해석 중, 회원 추가 정보 조회시 에러 발생: {}", e.getMessage());
            }

            // Auths 목록(uNo 필요 → DB에서 조회된 user.no 사용)
            Long uNo = user.getNo(); // null일 수도 있음(게스트/임시 계정 등)
            List<Auths> authList = roleStrings.stream()
                .map(r -> {
                    Auths auths = new Auths();
                    auths.setUNo(uNo);
                    auths.setAuth(r);
                    return auths;
                })
                .collect(Collectors.toList());
            user.setAuthList(authList);

            UserDetails userDetails = new CustomUser(user);

            return new UsernamePasswordAuthenticationToken(userDetails, null, authorities);

        } catch (ExpiredJwtException exception) {
            log.warn("만료된 JWT: {}, msg: {}", authorization, exception.getMessage());
        } catch (UnsupportedJwtException exception) {
            log.warn("지원하지 않는 JWT: {}, msg: {}", authorization, exception.getMessage());
        } catch (MalformedJwtException exception) {
            log.warn("손상된 JWT: {}, msg: {}", authorization, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            log.warn("빈/널 JWT: {}, msg: {}", authorization, exception.getMessage());
        } catch (JwtException exception) {
            log.warn("JWT 파싱 실패: {}", exception.getMessage());
        }

        return null;
    }

    /**
     * 토큰 검증 (만료/서명 체크)
     */
    public boolean validateToken(String jwtOrBearer) {
        try {
            String jwt = extractJwt(jwtOrBearer);
            if (jwt.isBlank()) return false;

            Jws<Claims> claims = Jwts.parser()
                    .verifyWith(getShaKey())
                    .build()
                    .parseSignedClaims(jwt);

            Date expiration = claims.getPayload().getExpiration();
            log.info("만료기간: {}", expiration);

            return expiration != null && expiration.after(new Date());
        } catch (ExpiredJwtException e) {
            log.error("토큰 만료");
        } catch (JwtException e) {
            log.error("토큰 손상/검증 실패");
        } catch (NullPointerException e) {
            log.error("토큰 없음");
        } catch (Exception e) {
            log.error("토큰 검증 예외");
        }
        return false;
    }

    /**
     * "secret-key" → SecretKey
     */
    public SecretKey getShaKey() {
        String secretKey = jwtProps.getSecretKey();
        byte[] signingKey = secretKey.getBytes();
        return Keys.hmacShaKeyFor(signingKey);
    }

    /**
     * "Bearer xxx" → "xxx"
     */
    private String extractJwt(String authorizationOrJwt) {
        if (authorizationOrJwt == null) return "";
        String s = authorizationOrJwt.trim();
        if (s.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            return s.substring(SecurityConstants.TOKEN_PREFIX.length()).trim();
        }
        return s;
    }

    /**
     * roles 클레임을 안전하게 List<String>으로 변환
     */
    @SuppressWarnings("unchecked")
    private List<String> normalizeRoles(Object rolesClaim) {
        if (rolesClaim == null) return Collections.emptyList();

        if (rolesClaim instanceof List<?>) {
            List<?> raw = (List<?>) rolesClaim;

            // 케이스 1) List<String>
            if (raw.stream().allMatch(o -> o == null || o instanceof String)) {
                return raw.stream().filter(Objects::nonNull).map(Object::toString).collect(Collectors.toList());
            }

            // 케이스 2) List<Map> 등(예방적 변환)
            return raw.stream()
                    .map(Objects::toString)
                    .collect(Collectors.toList());
        }

        // 단일 문자열인 경우(예외 케이스)
        return Collections.singletonList(rolesClaim.toString());
    }
}
