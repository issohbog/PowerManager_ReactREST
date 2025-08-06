package com.aloha.magicpos.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.aloha.magicpos.util.MediaUtil;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Controller
@RequestMapping("/upload/images")
public class FileController {

    @Value("${file.upload-dir}")
    String uploadPath;

    @GetMapping("/products/{fileName}")
    public void image(
        @PathVariable("fileName") String fileName,
        HttpServletResponse response
    ) throws Exception {
        log.info("filePath : {}", fileName);
        File file = new File(uploadPath + fileName);
        // 업로드된 파일을 입력받아 클라이언트로 출력
        FileInputStream fis = new FileInputStream(file);
        ServletOutputStream sos = response.getOutputStream();
        FileCopyUtils.copy(fis, sos);

        // 이미지 썸네일로 응답이 되도록 헤더 세팅 
        // - 확장자로 컨텐츠 타입 지정 
        // ex) C:/upload/test.sample.png
        String ext = fileName.substring(fileName.lastIndexOf(".") + 1);         // 확장자
        MediaType mediaType = MediaUtil.getMediaType(ext);
        if( mediaType == null) return;
        log.info("mediaType : {}", mediaType);
        response.setContentType( mediaType.toString());             // image/png
    }
    
    
}
