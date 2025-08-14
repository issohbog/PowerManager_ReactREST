package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.domain.Orders;
import com.aloha.magicpos.domain.OrdersDetails;
import com.aloha.magicpos.mapper.OrderDetailMapper;
import com.aloha.magicpos.mapper.OrderMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("OrderService")
public class OrderServiceImpl implements OrderService{
    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderDetailMapper orderDetailMapper;

    @Override
    public boolean insertOrder(Orders order) throws Exception {
        return orderMapper.insert(order) > 0;
    }

    @Override
    public boolean insertOrderDetail(Long oNo, OrdersDetails detail) throws Exception {
        detail.setONo(oNo);
        return orderDetailMapper.insert(detail) > 0;
    }

    @Override
    public boolean updateStatus(Long no, Long orderStatus, Long paymentStatus) throws Exception {
        return orderMapper.updateStatus(no, orderStatus, paymentStatus) >0;
    }

    @Override
    public boolean deleteOrder(Long no) throws Exception {
        int detailsDeleted = orderDetailMapper.deleteByOrderNo(no);  // 상세 먼저 삭제
        int orderDeleted = orderMapper.delete(no);                 // 주문 삭제
        return detailsDeleted >= 0 && orderDeleted > 0;
    }

    @Override
    public List<Orders> findAllOrders() throws Exception {
        return orderMapper.findAll();
    }

    @Override
    public List<Orders> findOrdersByUser(Long uNo) throws Exception {
        return orderMapper.findByUser(uNo);
    }

    @Override
    public Orders findOrderByNo(Long no) throws Exception {
        return orderMapper.findByNo(no);
    }

    @Override
    public List<OrdersDetails> findOrderDetails(Long oNo) throws Exception {
        return orderDetailMapper.findByOrderNo(oNo);
    }

    @Override
    public List<Map<String, Object>> findDetailsWithProductNames(Long oNo) throws Exception {
        return orderDetailMapper.findDetailsWithProductNamesByOrderNo(oNo);
    }

    @Override
    public boolean updateOrderDetailQuantity(Long oNo, Long pNo, Long quantity) throws Exception {
        return orderDetailMapper.updateQuantity(oNo, pNo, quantity) >0;
    }

    @Override
    public boolean deleteOrderDetail(Long oNo, Long pNo) throws Exception {
        boolean isDeleted = orderDetailMapper.delete(oNo, pNo) > 0;

        // 삭제 후, 남은 상세가 있는지 확인
        List<OrdersDetails> remainDetails = orderDetailMapper.findByOrderNo(oNo);
        if (remainDetails.isEmpty()) {
            // 아무것도 없으면 주문도 삭제
            orderMapper.delete(oNo);
        }

        return isDeleted;
    }


    @Override
    public List<Orders> findOrdersByStatus(List<Long> orderStatus) throws Exception {
        if (orderStatus == null || orderStatus.isEmpty()) {
            log.warn("❗ 주문 상태 목록이 비어있음");
            return List.of(); // 빈 리스트 반환
        }
        return orderMapper.findOrdersByStatus(orderStatus);
    }

    @Override
    public Long countByStatus(List<Long> orderStatus) throws Exception {
        if (orderStatus == null || orderStatus.isEmpty()) {
            log.warn("❗ 주문 상태 목록이 비어있음");
            return 0L;
        }
        // findOrdersByStatus를 재사용해서 크기만 가져옴
        return (long) findOrdersByStatus(orderStatus).size();
    }

    @Override
    public boolean increaseQuantity(Long oNo, Long pNo) throws Exception {
        return orderDetailMapper.increaseQuantity(oNo, pNo) > 0;
    }

    @Override
    public boolean decreaseQuantity(Long oNo, Long pNo) throws Exception {
        return orderDetailMapper.decreaseQuantity(oNo, pNo) > 0;
    }
    
    @Override
    public Long getQuantityByOrderAndProduct(Long oNo, Long pNo) {
        return orderDetailMapper.getQuantityByOrderAndProduct(oNo, pNo);
    }

    @Override
    public void updateStatusWithPayAt(Long no, Long orderStatus, Long paymentStatus) {
        orderMapper.updateStatus(no, orderStatus, paymentStatus);

        Orders order = orderMapper.findByNo(no); // 💡 주문 전체 정보 가져오기
        String payment = order.getPayment();          // 💳 결제 방식 (ex. "현금", "카드")

        Long newPaymentStatus = paymentStatus;
        if (orderStatus == 2L) {
            newPaymentStatus = 1L; // 전달완료되면 결제 완료 처리
        }

        orderMapper.updateStatus(no, orderStatus, newPaymentStatus);

        // 💡 현금이면서 전달완료일 때만 pay_at 설정
        if ("현금".equals(payment) && orderStatus == 2L) {
            orderMapper.updatePayAtNow(no);
        }
    }
    @Override
    public void updateTotalPrice(Long orderNo) throws Exception {
        orderMapper.updateTotalPrice(orderNo);
    }
}
