package com.aloha.magicpos.domain;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;

@Data
public class Users {
    private Long no;
    private String id;
    private String username;
    private String password;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date birth;
    private String gender;
    
    private String email;
    private String phone;
    private String memo;
    private LocalDateTime createdAt;
    private List<Auths> authList;
    private int enabled;

    // UserServiceImpl 에서 임시비밀번호 생성 후 UserController에 전달용
    private String tempPassword;

    // 회원정보 수정 시 사용시간 및 남은시간 수정용 
    private Long usedMin;
    private Long remainMin;
}
