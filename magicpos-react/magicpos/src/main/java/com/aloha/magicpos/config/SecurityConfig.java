package com.aloha.magicpos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.aloha.magicpos.security.filter.JwtAuthenticationFilter;
import com.aloha.magicpos.security.filter.JwtRequestFilter;
import com.aloha.magicpos.security.provider.JwtProvider;
import com.aloha.magicpos.service.UserDetailServiceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailServiceImpl userDetailServiceImpl;
    private final JwtProvider jwtProvider;

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   AuthenticationManager authenticationManager) throws Exception {

        http
            // JWT 쓰므로 전부 비활성
            .csrf(csrf -> csrf.disable())
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .logout(lo -> lo.disable())
            // 세션 미사용
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 정적 리소스(누구나 접근 가능)
                .requestMatchers(
                    "/css/**", "/js/**", "/images/**", "/favicon.ico",
                    "/static/**", "/public/**", "/assets/**"
                ).permitAll()
                // 로그인/회원가입/토큰 재발급 등 공개 엔드포인트
                .requestMatchers(
                    "/login", "/auth/login", "/auth/refresh", "/api/login",
                    "/users/signup", "/users/new", "/users/admin/check-id"
                ).permitAll()
                // 공개 API가 더 있으면 여기에 추가
                .requestMatchers(
                    "/admin/payment/ticket/success",            // 관리자 요금제 결제 성공 url ip:8080으로 들어올때 접근 허용
                    "/users/payment/ticket/success",                        // 사용자 요금제 결제 성공 url ip:8080으로 들어올때 접근 허용
                    "/upload/**"                                            // 업로드된 이미지 상품 수정시 나오도록 접근 허용
                ).permitAll()
                // 관리자 전용
                .requestMatchers(
                    "/admin/**",
                    "/users/admin/**",
                    "/products/admin/**",
                    "/categories/admin/**",
                    "/usertickets/admin/**",
                    "/logs/**",
                    "/seats/**"
                ).hasRole("ADMIN")
                // 회원/관리자 공용
                .requestMatchers(
                    "/menu", "/menu/**",
                    "/carts", "/carts/**",
                    "/users/**",
                    "/userticket/insert"
                ).hasAnyRole("USER","ADMIN")
                // 그 외는 인증 필요
                .anyRequest().authenticated()
            )
            // 유저 디테일 서비스
            .userDetailsService(userDetailServiceImpl)
            // 🔑 필터 체인
            // 로그인 시도 처리 (아이디/비번 받아 JWT 발급 역할이라면)
            .addFilterAt(new JwtAuthenticationFilter(authenticationManager, jwtProvider),
                    UsernamePasswordAuthenticationFilter.class)
            // 모든 요청에서 JWT 검증
            .addFilterBefore(new JwtRequestFilter(authenticationManager, jwtProvider),
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration cfg = new CorsConfiguration();

        cfg.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174", "http://192.168.30.6:5173", "http://192.168.30.6:5174"));
        cfg.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(Arrays.asList("*"));
        cfg.setAllowCredentials(true);



        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
 