package com.aloha.magicpos.controller;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.AuthenticationRequest;
import com.aloha.magicpos.domain.Auths;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.security.constants.SecurityConstants;
import com.aloha.magicpos.security.props.JwtProps;
import com.aloha.magicpos.service.SeatService;
import com.aloha.magicpos.service.UserService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT 토큰 생성
 *  - 로그인 요청 ➡ 인증 ➡ JWT 토큰 생성
 * 
 * JWT 토큰 해석
 *  - 인증 자원 요청 ➡ JWT 토큰 해석
 */
@Slf4j
@RestController
public class LoginController {

  @Autowired private JwtProps jwtProps;  // secretKey 
  @Autowired private SeatService seatService;
  @Autowired private UserService userService;

 /**
   * 로그인 요청
   * 👩‍💼➡🔐 : 로그인 요청을 통해 인증 시, JWT 토큰 생성
   * 🔗 [POST] - /login
   * 💌 body : 
   * {
   *      "username" : "aloha",
   *      "password" : "123456"
   * }
   * @param authReq
   * @return
 * @throws Exception 
   */
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody AuthenticationRequest authReq) throws Exception {
    final String username = authReq.getUsername();
    final String rawPassword = authReq.getPassword();
    final String seatId = authReq.getSeatId();

    // 0) 입력값 가드
    if (username == null || rawPassword == null || seatId == null || seatId.isBlank()) {
        return ResponseEntity.badRequest().body(Map.of("error", "badRequest"));
    }
    
    // 1) 아이디/비번 검증
    if (!userService.isValid(username, rawPassword)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "loginFail"));
    }

    // 2) 좌석 상태 체크 (0=정상 가정)
    Integer status = seatService.getSeatStatus(seatId); // NPE 방지 Integer
    if (status == null || status != 0) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "seatInUse"));
    }

    // 3) 사용자 로드 → userNo 얻기
    Users user = userService.select(username); // UserMapper.select(id) 사용 (XML에 있음)
    if (user == null || Boolean.FALSE.equals(user.getEnabled())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "loginFail"));
    }
    Long userNo = user.getNo();

    log.info("로그인시 userNo: {}", userNo);

    // 4) 역할 조회 → 문자열 리스트로 변환
    List<Auths> auths = userService.selectAuths(userNo);
    List<String> roles = (auths == null ? List.<String>of() :
            auths.stream()
                 .map(Auths::getAuth)      // "ROLE_USER", "ROLE_ADMIN"
                 .filter(Objects::nonNull)
                 .distinct()
                 .collect(Collectors.toList()));
    if (roles.isEmpty()) roles = List.of("ROLE_USER"); // 기본 권한 보정(선택)

    // 5) JWT 생성
    String secretKey = jwtProps.getSecretKey();
    byte[] signingKey = secretKey.getBytes(StandardCharsets.UTF_8);
    long expiresMs = 1000L * 60 * 60 * 24 * 5; // 5일

    String jwt = Jwts.builder()
            .signWith(Keys.hmacShaKeyFor(signingKey), Jwts.SIG.HS512)
            .header().add("typ", "JWT").and()
            .claim("uid", username)
            .claim("rol", roles)
            .expiration(new Date(System.currentTimeMillis() + expiresMs))
            .compact();

    // 6) 성공 응답(JSON)
    return ResponseEntity.ok(Map.of("token", jwt));
}



  /**
   * JWT 토큰 해석
   * 💍➡📨 JWT
   * @param header
   * @return
   */
  @GetMapping("/user")
  public ResponseEntity<?> user(@RequestHeader(name = "Authorization") String authorization) {
      log.info("Authrization : " + authorization);

      // Authrization : "Bearer " + 💍(jwt)
      String jwt = authorization.substring(7);
      log.info("jwt : " + jwt);

      String secretKey = jwtProps.getSecretKey();
      byte[] signingKey = secretKey.getBytes();

      // JWT 토큰 해석 : 💍 ➡ 👩‍💼
      Jws<Claims> parsedToken = Jwts.parser()
                                      .verifyWith(Keys.hmacShaKeyFor(signingKey))
                                      .build()
                                      .parseSignedClaims(jwt);

      String username = parsedToken.getPayload().get("uid").toString();
      log.info("username : " + username);

      Object roles = parsedToken.getPayload().get("rol");
      List<String> roleList = (List<String>) roles;
      log.info("roles : " + roles);
      log.info("roleList : " + roleList);

      return new ResponseEntity<>(parsedToken.toString(), HttpStatus.OK);
  }

  
}
