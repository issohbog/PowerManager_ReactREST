package com.aloha.magicpos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.domain.Categories;
import com.aloha.magicpos.mapper.CategoryMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("CategoryService")
public class CategoryServiceImpl implements CategoryService{
    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public boolean create(Categories category) throws Exception {
        return categoryMapper.insert(category) > 0;
    }

    @Override
    public boolean update(Long no, Categories category) throws Exception {
        category.setNo(no);
        return categoryMapper.update(category) > 0; 
    }

    @Override
    public boolean delete(Long no) throws Exception {
        return categoryMapper.delete(no) > 0;
    }

    @Override
    public List<Categories> findAll() throws Exception {
        return categoryMapper.findAll();
    }

    @Override
    public Categories findByNo(Long no) throws Exception {
        return categoryMapper.findByNo(no);
    }
    
}
