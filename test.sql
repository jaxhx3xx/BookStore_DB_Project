USE Bookstore_DB;

-- 1. 방금 꼬인 데이터들(UPDATE, DELETE, INSERT) 흔적도 없이 싹 청소
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ORDER_DETAIL;
TRUNCATE TABLE ORDERS;
TRUNCATE TABLE BOOK;
TRUNCATE TABLE MEMBER;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. 원래 기본 회원 가입 데이터 다시 넣기
INSERT INTO MEMBER (member_id, password, name) VALUES 
('user01', 'password123', '홍길동'),
('Jeong', 'aaa555', '정재희');

-- 3. 웹페이지와 100% 일치하는 진짜 원래 책 8권으로 재입고! (원상복구 ⭐)
INSERT INTO BOOK (title, author, price, stock, published_date) VALUES 
('불편한 편의점', '김호연', 14000, 100, '2021-04-20'),
('모순', '양귀자', 13000, 100, '2013-04-01'),
('데미안', '헤르만 헤세', 12000, 100, '1919-01-01'),
('미움받을 용기', '기시미 이치로', 15000, 100, '2014-11-17'),
('혼자 공부하는 자바', '신용권', 28000, 100, '2023-05-10'),
('달러구트 꿈 백화점', '이미예', 13800, 100, '2020-07-08'),
('부자 아빠 가난한 아빠', '로버트 기요사키', 17000, 100, '2022-10-20'),
('미드나잇 라이브러리', '매트 헤이그', 15800, 100, '2021-04-28');

-- 4. 잘 들어갔는지 눈으로 슬쩍 확인용
SELECT * FROM MEMBER;
SELECT * FROM BOOK;
SELECT * FROM ORDERS;
SELECT * FROM ORDER_DETAIL;
SELECT * FROM cart;

DELETE FROM CART WHERE cart_id = 1;

SELECT * FROM cart;