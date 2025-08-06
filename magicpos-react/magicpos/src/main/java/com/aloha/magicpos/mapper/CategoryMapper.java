package com.aloha.magicpos.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.magicpos.domain.Categories;

@Mapper
public interface CategoryMapper {
    // 카테고리 등록
    int insert(Categories category);

    // 카테고리 이름 수정
    int update(Categories category);

    // 카테고리 삭제
    int delete(Long no);

    // 전체 카테고리 조회
    List<Categories> findAll();

    // 단일 카테고리 조회
    Categories findByNo(Long no);
}
