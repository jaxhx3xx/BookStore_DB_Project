USE Bookstore_DB;

--  회원(MEMBER) 테이블 생성 
CREATE TABLE MEMBER (
    member_id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE BOOK(
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    author VARCHAR(50),
    price INT NOT NULL,
    published_date DATE
)

