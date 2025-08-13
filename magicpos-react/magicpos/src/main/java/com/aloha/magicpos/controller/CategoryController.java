package com.aloha.magicpos.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.service.CategoryService;

import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@Controller
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // 카테고리 등록
    @PostMapping("/admin/create")
    public ResponseEntity<Map<String, Object>> insertCategory(@RequestBody Categories category) throws Exception {
        Map<String, Object> response = new HashMap<>();
        log.info("Inserting category: {}", category);
        try {
            categoryService.create(category);
            response.put("success", true);
            response.put("message", "Category created successfully");
            log.info("Category created: {}", category);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating category");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 카테고리 수정
    @PutMapping("/admin/update")
    public ResponseEntity<Map<String, Object>> updateCategory(@RequestBody Categories category) {
        Map<String, Object> response = new HashMap<>();
        try {
            categoryService.update(category.getNo(), category);
            response.put("success", true);
            response.put("message", "Category updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating category");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 카테고리 삭제
    @DeleteMapping("/admin/delete")
    public ResponseEntity<Map<String, Object>> deleteCategory(@RequestBody Categories category) {
        Map<String, Object> response = new HashMap<>();
        try {
            categoryService.delete(category.getNo());
            response.put("success", true);
            response.put("message", "Category deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting category");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 전체 조회
    @GetMapping("/admin/getall")
    public ResponseEntity<Map<String, Object>> findAllCategories() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Categories> categories = categoryService.findAll();
            response.put("success", true);
            response.put("categories", categories);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching categories");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 단일 조회
    @GetMapping("/{no}")
    public ResponseEntity<Map<String, Object>> findByNo(@PathVariable Long no) {
        Map<String, Object> response = new HashMap<>();
        try {
            Categories category = categoryService.findByNo(no);
            response.put("success", true);
            response.put("category", category);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching category");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
