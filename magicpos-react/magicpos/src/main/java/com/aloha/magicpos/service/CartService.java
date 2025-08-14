package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.Carts;

public interface CartService {
    public boolean addToCart(Carts carts) throws Exception;
    public boolean increaseQuantity(Long uNo,Long pNo) throws Exception;
    public boolean decreaseQuantity(Long uNo, Long pNo) throws Exception;
    public boolean delete(@Param("cartNo") Long cartNo) throws Exception;
    public List<Carts> getUserCart(Long uNo) throws Exception;
    public List<Carts> getCartListByUser(Long uNo) throws Exception;
    public Carts findByUserAndProduct(@Param("uNo") Long uNo, @Param("pNo") Long pNo) throws Exception;
    public List<Map<String, Object>> getCartWithProductByUser(Long uNo) throws Exception;
    public int getTotalPrice(Long uNo) throws Exception;
    public boolean deleteAllByUserNo(Long userNo) throws Exception;
    public List<Map<String, Object>> findCartWithProductByUser(Long userNo);
    public Long getQuantity(Long uNo, Long pNo) throws Exception;
}
