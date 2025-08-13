package com.aloha.magicpos.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

    @Autowired ResourceLoader resourceLoader;       // resource 자원 가져오는 객체 

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

    // 썸네일 이미지 
    @GetMapping("/img")
    public void thumbnailImg(
        @RequestParam("filePath") String filePath,
        HttpServletResponse response
    ) throws IOException {

        log.info("thumbnail filePath : {}", filePath);
        String fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
        File imgFile = (filePath != null) ? new File(uploadPath + fileName) : null;
        // 파일 경로가 null 또는 파일이 존재하지 않는 경우 ➡ no-image
        // org.springframework.core.io.Resource
        Resource resource = resourceLoader.getResource("classpath:static/images/검색.png");
        
        if( filePath == null || !imgFile.exists() ) {
            // no-image.png 로 적용 
            imgFile = resource.getFile();
            filePath = imgFile.getPath();
        }

        // 확장자 
        String ext = filePath.substring(filePath.lastIndexOf(".") + 1);
        String mimeType = MimeTypeUtils.parseMimeType("image/" + ext).toString();
        MediaType mType = MediaType.valueOf(mimeType);

        if( mType == null ) {
            // 이미지 타입이 아닌 경우 
            response.setContentType(MediaType.IMAGE_PNG_VALUE);
            imgFile = resource.getFile();
        } 
        else {
            // 이미지 타입 
            response.setContentType(mType.toString());
        }
        FileInputStream fis = new FileInputStream(imgFile);
        ServletOutputStream sos = response.getOutputStream();
        FileCopyUtils.copy(fis, sos);
        fis.close();
        sos.close();

    }
    
    
}
