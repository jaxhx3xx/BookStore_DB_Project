USE Bookstore_DB;

-- 데이터가 꼬이지 않게 자식 테이블부터 깨끗하게 청소하고 테스트 시작!
TRUNCATE TABLE ORDER_DETAIL;
SET FOREIGN_KEY_CHECKS = 0; -- 안전한 비우기를 위해 잠시 외래키 체크 해제
TRUNCATE TABLE ORDERS;
TRUNCATE TABLE BOOK;
TRUNCATE TABLE MEMBER;
SET FOREIGN_KEY_CHECKS = 1; -- 청소 끝났으니 다시 체크 켜기

-- ========================================================
-- 1. MEMBER 테스트 (회원 2명 등록)
-- ========================================================
INSERT INTO MEMBER (member_id, password, name) VALUES 
('Jeong', 'aaa555', '정재희'),
('Hong', 'hong123', '홍길동');

-- ========================================================
-- 2. BOOK 테스트 (도서 3권 입고 - 수량, 가격 정상 작동 체크)
-- ========================================================
INSERT INTO BOOK (title, author, price, stock, published_date) VALUES 
('재미있는 SQL 실습', '천재개발자', 25000, 50, '2026-06-10'),
('혼자 공부하는 자바', '신용권', 28000, 30, '2023-05-10'),
('달러구트 꿈 백화점', '이미예', 13800, 40, '2020-07-08');

-- ========================================================
-- 3. ORDERS 테스트 (주문서 2개 발행)
-- ========================================================
-- [1번 주문] 정재희 회원이 주문 시작 (order_id: 1 자동 생성)
INSERT INTO ORDERS (member_id) VALUES ('Jeong');

-- [2번 주문] 홍길동 회원이 주문 시작 (order_id: 2 자동 생성)
INSERT INTO ORDERS (member_id) VALUES ('Hong');

-- ========================================================
-- 4. ORDER_DETAIL 테스트 (복합키 및 상세 영수증 등록)
-- ========================================================
-- 정재희 회원(1번 주문)이 1번 책 2권 구매 (당시 가격 25000원)
INSERT INTO ORDER_DETAIL (order_id, book_id, quantity, order_price) 
VALUES (1, 1, 2, 25000);

-- 정재희 회원(1번 주문)이 2번 책 1권 추가 구매 (당시 가격 28000원)
-- 💡 포인트: 1번 주문서 안에 1번 책, 2번 책 종류별로 1줄씩 이쁘게 들어감!
INSERT INTO ORDER_DETAIL (order_id, book_id, quantity, order_price) 
VALUES (1, 2, 1, 28000);

-- 홍길동 회원(2번 주문)이 3번 책 1권 구매 (당시 가격 13800원)
INSERT INTO ORDER_DETAIL (order_id, book_id, quantity, order_price) 
VALUES (2, 3, 1, 13800);

-- ========================================================
-- 5. 🔍 최종 검증 (모든 연결이 타당한지 한눈에 조회)
-- ========================================================
SELECT 
    od.order_id AS '주문번호',
    m.name AS '구매자명',
    b.title AS '구매도서',
    od.quantity AS '수량',
    od.order_price AS '구입단가',
    (od.quantity * od.order_price) AS '총결제금액',
    o.order_date AS '주문일시'
FROM ORDER_DETAIL od
JOIN ORDERS o ON od.order_id = o.order_id
JOIN MEMBER m ON o.member_id = m.member_id
JOIN BOOK b ON od.book_id = b.book_id;