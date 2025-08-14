-- Active: 1750388007092@@127.0.0.1@3306@magicpos
        SELECT 
            p.no AS productNo,
            IFNULL(SUM(CASE WHEN DATE(o.order_time) = CURDATE() THEN od.quantity ELSE 0 END), 0) AS todaySales
        FROM 
            products p
        LEFT JOIN orders_details od ON p.no = od.p_no
        LEFT JOIN orders o ON od.o_no = o.no
        GROUP BY p.no;


SELECT *
FROM orders
WHERE DATE(order_time) = '2025-07-09'
;

UPDATE orders
SET order_time = now()
WHERE DATE(order_time) = '2025-07-09';



SELECT 
    s.seat_id,
    s.seat_name,
    s.seat_status,
    u.no AS user_no,
    u.username,
    ut.remain_time,
    sr.start_time,
    sr.end_time
FROM users u
LEFT JOIN seats_reservations sr ON u.no = sr.u_no
LEFT JOIN seats s ON s.seat_id = sr.seat_id
LEFT JOIN user_tickets ut ON u.no = ut.u_no
WHERE u.no = 2
ORDER BY sr.end_time DESC
LIMIT 1
;

SELECT *
FROM users u
WHERE u.no = 2
;

SELECT *
FROM seats s
WHERE u.no = 2
;

SELECT *
FROM seats_reservations s

;



SELECT sr.seat_id, sr.start_time, sr.end_time, u.username 
FROM seats_reservations sr JOIN users u ON sr.u_no = u.no 
WHERE sr.u_no = 10 AND sr.end_time >= NOW() 
ORDER BY sr.start_time DESC LIMIT 1;




SELECT l.*, u.username, u.id AS user_id,
       CASE 
          WHEN l.action_type = '상품 구매' THEN o.total_price
          WHEN l.action_type = '이용권 구매' THEN t.price 
          ELSE NULL
        END AS price
FROM logs l
JOIN users u ON l.u_no = u.no
LEFT JOIN orders o ON l.u_no = o.u_no
LEFT JOIN user_tickets ut ON l.u_no = ut.u_no
LEFT JOIN tickets t ON ut.t_no = t.no
WHERE DATE(l.created_at) BETWEEN '2025-07-22' AND '2025-07-22'
ORDER BY l.created_at DESC
;



SELECT l.*, u.username, u.id AS user_id,
       CASE 
          WHEN l.action_type = '상품 구매' THEN (
              SELECT o.total_price 
              FROM orders o 
              WHERE o.u_no = l.u_no 
          )     AND 
          WHEN l.action_type = '이용권 구매' THEN (
              SELECT t.price 
              FROM user_tickets ut
              JOIN tickets t ON ut.t_no = t.no
              WHERE ut.u_no = l.u_no 
                AND DATE(ut.pay_at) = DATE(l.created_at)
              ORDER BY ut.pay_at DESC 
              LIMIT 1
          )
          ELSE NULL
        END AS price
FROM logs l
JOIN users u ON l.u_no = u.no
WHERE DATE(l.created_at) BETWEEN '2025-07-22' AND '2025-07-22'
ORDER BY l.created_at DESC
;

SELECT *
FROM orders
;


SELECT *
FROM logs l
JOIN (
    SELECT u.*
          ,o.total_price
    FROM users u 
    LEFT JOIN orders o ON u.no = o.u_no
) uo ON l.u_no = uo.no
;


SELECT *
FROM users u 
    LEFT JOIN orders o ON u.no = o.u_no
    ;


--

SELECT l.*, u.username, u.id AS user_id,
        CASE 
            WHEN l.action_type = '상품 구매' THEN (
                SELECT total_price
                FROM orders 
                WHERE order_time = l.created_at
            )     
            WHEN l.action_type = '이용권 구매' THEN (
                SELECT t.price 
                FROM user_tickets ut
                JOIN tickets t ON ut.t_no = t.no
                WHERE ut.u_no = l.u_no 
                    AND DATE(ut.pay_at) = DATE(l.created_at)
                ORDER BY ut.pay_at DESC 
                LIMIT 1
            )
            ELSE NULL
        END AS price
FROM logs l
JOIN users u ON l.u_no = u.no
WHERE DATE(l.created_at) BETWEEN #{startDate} AND #{endDate}
ORDER BY l.created_at DESC
LIMIT #{index}, #{size}
;

        SELECT * FROM (
            -- 주문결제 묶기
            SELECT 
                '주문결제' AS history_type,
                GROUP_CONCAT(p.p_name SEPARATOR ', ') AS item_name,
                u.username,
                u.id AS user_id,
                o.seat_id,
                o.total_price AS price,
                o.pay_at AS time
            FROM orders o
            JOIN users u ON o.u_no = u.no
            JOIN orders_details od ON o.no = od.o_no
            JOIN products p ON od.p_no = p.no
            WHERE DATE(o.pay_at) = CURDATE()
            AND o.payment_status = 1
            GROUP BY o.no

            UNION ALL

            SELECT 
                '이용권구매' AS history_type,
                t.ticket_name AS item_name,
                u.username,
                u.id AS user_id,
                NULL AS seat_id,
                t.price AS price,
                ut.pay_at AS time
            FROM user_tickets ut
            JOIN users u ON ut.u_no = u.no
            JOIN tickets t ON ut.t_no = t.no
            WHERE DATE(ut.pay_at) = CURDATE()
        ) AS combined
        ORDER BY time DESC
        

        -- ✅ 주문 데이터 있는지 확인
    SELECT COUNT(*) AS order_count 
FROM orders 
WHERE DATE(pay_at) = CURDATE() AND payment_status = 1;


        SELECT DISTINCT
            u.no AS userNo,
            u.username,
            u.id AS userId,
            u.phone,
            ut.remain_time,
            sr.start_time
        FROM seats s
        JOIN seats_reservations sr ON s.seat_id = sr.seat_id
        JOIN users u ON sr.u_no = u.no
        LEFT JOIN user_tickets ut ON ut.u_no = u.no
        WHERE s.seat_status = 1
        AND sr.end_time > NOW()
        ORDER BY sr.start_time DESC