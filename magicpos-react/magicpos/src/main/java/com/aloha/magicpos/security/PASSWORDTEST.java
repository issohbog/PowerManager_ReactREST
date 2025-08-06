package com.aloha.magicpos.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PASSWORDTEST {
        public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("pass7");
        System.out.println("암호화된 비밀번호: " + hash);
    }
}
