package com.aloha.magicpos.service;

import java.util.List;

import com.aloha.magicpos.domain.Categories;

public interface CategoryService {
    public boolean create(Categories category) throws Exception;
    public boolean update(Long no,Categories category) throws Exception;
    public boolean delete(Long no) throws Exception;
    public List<Categories> findAll() throws Exception;
    public Categories findByNo(Long no) throws Exception;
}
