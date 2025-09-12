package com.aloha.magicpos.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.extern.slf4j.Slf4j;


@Slf4j
@Controller
public class SwaggerController {

    /**
     * Swagger UI로 리다이렉트
     * @return
     */    
    @GetMapping({"docs", "/home"})
    public String home() {
        return "redirect:/swagger-ui/index.html";
    }

    
}
