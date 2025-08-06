package com.aloha.magicpos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.service.ProductService;

@RestController 
@RequestMapping("/admin/products")
public class AdminProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/json")
    @ResponseBody
    public List<Map<String, Object>> getProductListJson(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "category", required = false) Long categoryNo
    ) throws Exception {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return productService.searchProductsAllWithCategory(keyword); // 전체 검색용 쿼리 호출
        } else if (categoryNo != null) {
            return productService.findProductsByCategoryWithCategoryName(categoryNo); // 카테고리 필터용 쿼리 호출
        } else {
            return productService.getProductListWithCategory(); // 기본 전체 목록
        }
    }


}
