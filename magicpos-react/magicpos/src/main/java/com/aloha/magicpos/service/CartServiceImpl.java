package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.aloha.magicpos.domain.Carts;
import com.aloha.magicpos.mapper.CartMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("CartService")
public class CartServiceImpl implements CartService{

    @Autowired
    private CartMapper cartMapper;

    @Override
    public boolean addToCart(Carts carts) throws Exception {
        Carts existing = cartMapper.findByUserAndProduct(carts.getUNo(), carts.getPNo());
        if (existing != null) {
            return cartMapper.increaseQuantity(carts.getUNo(), carts.getPNo()) > 0;
        } else {
            return cartMapper.insert(carts) > 0;
        }
    }

    @Override
    public boolean increaseQuantity(Long uNo, Long pNo) throws Exception {
        return cartMapper.increaseQuantity(uNo, pNo) > 0;
    }

    @Override
    public boolean decreaseQuantity(Long uNo, Long pNo) throws Exception {
        // 현재 장바구니 항목 조회
        Carts cart = cartMapper.findByUserAndProduct(uNo, pNo);
        
        if (cart != null) {
            if (cart.getQuantity() <= 1) {
                // 수량이 1 이하이면 삭제
                return cartMapper.delete(cart.getNo()) > 0;
            } else {
                // 수량 감소
                return cartMapper.decreaseQuantity(uNo, pNo) > 0;
            }
        }
        return false;
    }


    
    @Override
    public List<Carts> getUserCart(Long uNo) throws Exception {
        return cartMapper.findByUser(uNo);
    }
    
    @Override
    public List<Carts> getCartListByUser(Long uNo) throws Exception{
        return cartMapper.findByUser(uNo);
    }
    
    @Override
    public List<Map<String, Object>> getCartWithProductByUser(Long uNo) throws Exception{
        return cartMapper.findCartWithProductByUser(uNo);
    }
    
    @Override
    public boolean delete(Long cartNo) throws Exception{
        return cartMapper.delete(cartNo) > 0;
    }

    @Override
    public int getTotalPrice(Long uNo) throws Exception {
        return cartMapper.getTotalPrice(uNo);
    }

    @Override
    public Carts findByUserAndProduct(Long uNo, Long pNo) throws Exception {
        return cartMapper.findByUserAndProduct(uNo, pNo);
    }

    @Override
    public boolean deleteAllByUserNo(Long userNo) throws Exception {
        return cartMapper.deleteAllByUserNo(userNo) > 0;
    }

    @Override
    public List<Map<String, Object>> findCartWithProductByUser(Long userNo) {
        return cartMapper.findCartWithProductByUser(userNo);
    }
}
