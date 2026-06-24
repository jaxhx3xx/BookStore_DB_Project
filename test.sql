USE Bookstore_DB;

-- 2. 원래 기본 회원 가입 데이터 넣기
INSERT INTO MEMBER (member_id, password, name) VALUES 
('user01', 'password123', '홍길동'),
('Jeong', 'aaa555', '정재희');

-- 3. 웹페이지와 100% 일치하는 진짜 원래 책 8권으로 재입고
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


-- 1. 자식 테이블(상세 내역) 데이터 먼저 삭제
DELETE FROM ORDER_DETAIL;
-- 2. 부모 테이블(주문 메인) 데이터 삭제
DELETE FROM ORDERS;
-- 3. 장바구니 테이블 데이터 삭제
DELETE FROM CART;

-- DELETE로 비우면 번호표가 누적되므로, 다음 주문이 1번부터 시작하도록 카운터를 직접 1로 세팅해 줍니다!
ALTER TABLE ORDERS AUTO_INCREMENT = 1;
ALTER TABLE ORDER_DETAIL AUTO_INCREMENT = 1;
ALTER TABLE CART AUTO_INCREMENT = 1;


 SELECT * FROM cart;
 SELECT * FROM order_detail;
 SELECT * FROM orders;