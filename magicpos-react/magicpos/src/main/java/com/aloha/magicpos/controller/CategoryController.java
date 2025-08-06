package com.aloha.magicpos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.service.CategoryService;

@Controller
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // 카테고리 등록
    @PostMapping("/admin/create")
    @ResponseBody
    public String insertCategory(@ModelAttribute Categories category) throws Exception {
        categoryService.create(category);
        return "ok";
    }

    // 카테고리 수정
    @PostMapping("/admin/update")
    @ResponseBody
    public String update(@ModelAttribute Categories category)  throws Exception{
        categoryService.update(category.getNo(), category);
        return "ok";
    }

    // 카테고리 삭제
    @PostMapping("/admin/delete")
    @ResponseBody
    public String delete(@ModelAttribute Categories category)  throws Exception{
        categoryService.delete(category.getNo());
        return "ok";
    }

    // 전체 조회
    @GetMapping
    @ResponseBody
    public List<Categories> findAll()  throws Exception{
        return categoryService.findAll();
    }

    // 단일 조회
    @GetMapping("/{no}")
    @ResponseBody
    public Categories findByNo(@PathVariable Long no)  throws Exception{
        return categoryService.findByNo(no);
    }
}
