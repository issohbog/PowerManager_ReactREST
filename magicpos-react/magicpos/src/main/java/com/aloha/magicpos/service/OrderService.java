package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;

public interface OrderService {
    public boolean insertOrder(Orders order) throws Exception;
    public boolean insertOrderDetail(Long oNo, OrdersDetails detail) throws Exception;
    public boolean updateStatus(Long no, Long orderStatus, Long paymentStatus) throws Exception;
    public boolean deleteOrder(Long no) throws Exception;
    public List<Orders> findAllOrders() throws Exception;
    public List<Orders> findOrdersByUser(Long uNo) throws Exception;
    public List<Orders> findOrdersByStatus(List<Long> orderStatus) throws Exception;
    public Long countByStatus(List<Long> orderStatus) throws Exception;
    public Orders findOrderByNo(Long no) throws Exception;
    public List<OrdersDetails> findOrderDetails(Long oNo) throws Exception;
    public List<Map<String, Object>> findDetailsWithProductNames(Long oNo) throws Exception;
    public boolean updateOrderDetailQuantity(Long oNo, Long pNo, Long quantity) throws Exception;
    // 수량 증가
    public boolean increaseQuantity(@Param("oNo") Long oNo, @Param("pNo") Long pNo) throws Exception;
    // 수량 감소
    public boolean decreaseQuantity(@Param("oNo") Long oNo, @Param("pNo") Long pNo) throws Exception;
    public boolean deleteOrderDetail(Long oNo, Long pNo) throws Exception;
    // 재고 조회
    public Long getQuantityByOrderAndProduct(Long oNo, Long pNo);

    // 현금 pay_at 업데이트
    void updateStatusWithPayAt(Long no, Long orderStatus, Long paymentStatus);

}
