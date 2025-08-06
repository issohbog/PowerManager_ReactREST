package com.aloha.magicpos.util;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.MediaType;

// 유틸(Util) : 자주 사용되는 기능이나 공통적으로 필요한 코드를 모아놓은 클래스, 모듈 
public class MediaUtil {
    
    private static Map<String, MediaType> mediaType;
    // static 초기화 블록 
    // : 클래스가 메모리에 로드될 때 한 번만 실행되는 코드 블록 
    static {
        mediaType = new HashMap<>();
        mediaType.put("JPG", MediaType.IMAGE_JPEG);
        mediaType.put("JPEG", MediaType.IMAGE_JPEG);
        mediaType.put("GIF", MediaType.IMAGE_GIF);
        mediaType.put("PNG", MediaType.IMAGE_PNG);
        mediaType.put("WEBP", MediaType.parseMediaType("image/webp"));
    }

    // 확장자를 컨텐츠 타입(MediaType) 으로 매핑 
    public static MediaType getMediaType(String ext){
        return mediaType.get(ext.toUpperCase());
    }
}
