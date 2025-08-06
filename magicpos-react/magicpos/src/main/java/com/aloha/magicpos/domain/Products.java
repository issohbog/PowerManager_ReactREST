package com.aloha.magicpos.domain;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class Products {
    private Long no;
    private Long cNo;
    private String pName;
    private Long pPrice;
    private String imgPath;
    private String description;
    private Boolean sellStatus;
    private Long stock;

    // 상품 등록시 이미지 db 저장용 
    private MultipartFile imageFile;

    // 당일 판매량 조회용 
    private Long todaySales;

    // 카테고리 명 조회용 
    private String cName;
}
