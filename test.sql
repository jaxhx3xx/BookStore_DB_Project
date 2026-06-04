USE Bookstore_DB;

USE Bookstore_DB;

TRUNCATE TABLE BOOK;

INSERT INTO BOOK (title, author, price, published_date) 
VALUES 
('혼자 공부하는 자바', '신용권', 28000, '2023-05-10'),
('달러구트 꿈 백화점', '이미예', 13800, '2020-07-08'),
('부자 아빠 가난한 아빠', '로버트 기요사키', 17000, '2022-10-25'),
('챗GPT 활용 가이드', '이선생', 22000, '2024-01-15'),
('미드나잇 라이브러리', '매트 헤이그', 15800, '2021-04-28');

SELECT * FROM BOOK;

INSERT INTO MEMBER (member_id, password, name) 
VALUES ('kim789', 'pass5678', '김철수'),
('Jeong','aaa555','정재희'),

INSERT INTO MEMBER (member_id, password, name) 
VALUES 
('Jeong', 'aaa555', '정재희'),
('Lee_coding', 'pwd123!', '이민수'),
('Park_star', 'star8888', '박서준'),
('Choi_data', 'sqlpass9', '최유진'),
('Han_db', 'dbmaster7', '한소희');

SELECT * FROM MEMBER;
