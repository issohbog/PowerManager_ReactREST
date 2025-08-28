
USE magicpos;

-- 외래키 제약을 잠시 해제

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `orders_details`;
TRUNCATE TABLE `seats_reservations`;
TRUNCATE TABLE `logs`;
TRUNCATE TABLE `user_tickets`;
TRUNCATE TABLE `auths`;
TRUNCATE TABLE `carts`;
TRUNCATE TABLE `orders`;

TRUNCATE TABLE `products`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `tickets`;
TRUNCATE TABLE `seats`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `chat_macros`;

-- 외래키 제약 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;


