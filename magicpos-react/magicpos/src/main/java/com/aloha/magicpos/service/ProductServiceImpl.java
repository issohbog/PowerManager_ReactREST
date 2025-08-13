package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.domain.Products;
import com.aloha.magicpos.mapper.ProductMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("ProductService")
public class ProductServiceImpl implements ProductService  {

    @Autowired private ProductMapper productMapper;

    @Override
    public boolean insert(Products product) throws Exception {
        return productMapper.insert(product) > 0;
    }

    @Override
    public boolean update(Products product) throws Exception {
        return productMapper.update(product) > 0;
    }


    @Override
    public boolean delete(Long no) throws Exception {
        return productMapper.delete(no) > 0;
    }

    @Override
    public List<Products> findAll() throws Exception {
        return productMapper.findAll();
    }

    @Override
    public Products findById(Long no) throws Exception {
        return productMapper.findById(no);
    }

    @Override
    public List<Products> findByCategory(Long cNo) throws Exception {
        return productMapper.findByCategory(cNo);
    }

    @Override
    public boolean decreaseStock(Long pNo, Long quantity) throws Exception {
        return productMapper.decreaseStock(pNo, quantity) > 0;
    }

    @Override
    public boolean increaseStock(Long pNo, Long quantity) throws Exception {
        return productMapper.increaseStock(pNo, quantity) > 0;
    }


    @Override
    public boolean updateStock(Long pNo, int newStock) throws Exception {
        return productMapper.updateStock(pNo, newStock) > 0;
    }   
    

    @Override
    public List<Products> searchProducts(Long cNo, String keyword) throws Exception {
        return productMapper.searchProducts(cNo, keyword);
    }

    @Override
    public List<Products> searchProductsAll(String keyword) throws Exception {
        return productMapper.searchProductsAll(keyword);
    }

    @Override
    public Map<Long, Long> findTodaySalesMap() {
        List<Map<String, Object>> list = productMapper.findTodaySalesMap();
        return list.stream()
            .filter(m -> m.get("productNo") != null) 
            .collect(Collectors.toMap(
                m -> ((Number) m.get("productNo")).longValue(),
                m -> {
                    Object val = m.get("todaySales");
                    return val != null ? ((Number) val).longValue() : 0L;
                }
            ));
    }


    @Override
    public Long selectStockByPNo(Long pNo) throws Exception {
        return productMapper.selectStockByPNo(pNo);
    }

    @Override
    public List<Map<String, Object>> getProductListWithCategory() throws Exception {
        return productMapper.getProductListWithCategory();
    }

    /**
     * 전체 상품 수 조회 
     */
    @Override
    public int countProducts(String type, String keyword) {
        if(type == null || type.isBlank() || keyword == null || keyword.isBlank()){
            return productMapper.countAll();
        }
        try {
            Long cNo = Long.parseLong(type);
            return productMapper.countByCategoryAndKeyword(cNo, keyword);
        } catch (NumberFormatException e) {
            return productMapper.countAll(); 
    }
    }

    @Override
    public List<Products> findAllforAdmin(int index, int size) throws Exception {
        return productMapper.findAllforAdmin(index, size);
    }

    @Override
    public List<Products> searchProductsforAdmin(Long cNo, String keyword, int index, int size) throws Exception {
        return productMapper.searchProductsforAdmin(cNo, keyword, index, size);
    }   
    @Override
    public List<Products> findProductsByCategory(Long cNo, int index, int size) throws Exception {
        return productMapper.findProductsByCategory(cNo, index, size);
    }
    
    @Override
    public List<Map<String, Object>> searchProductsAllWithCategory(String keyword) {
        return productMapper.searchProductsAllWithCategory(keyword);
    }

    @Override
    public List<Map<String, Object>> findProductsByCategoryWithCategoryName(Long categoryNo) {
        return productMapper.findProductsByCategoryWithCategoryName(categoryNo);
    }



}
