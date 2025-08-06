package com.aloha.magicpos.controller;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginRedirectController {

    @GetMapping({"/", "/login"})
    public String loginRedirect(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()
            && !(authentication instanceof AnonymousAuthenticationToken)) {
            return "redirect:/menu"; // 이미 로그인한 유저는 여기로
        }
        return "login"; // 로그인 안된 경우에만 로그인 페이지 보여줌
    }
}

