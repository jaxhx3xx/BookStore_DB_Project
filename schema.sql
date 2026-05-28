-- 1. sys 방에 잘못 들어가 있던 옛날 테이블을 청소합니다.
DROP TABLE IF EXISTS sys.member;

-- 2. 이미 Bookstore_DB 방이 있다면 싹 밀어버립니다. (이게 있어서 이제 오류가 안 나요!)
DROP DATABASE IF EXISTS Bookstore_DB;

-- 3. 한글 설정이 포함된 깨끗한 서점 방을 새로 만듭니다.
CREATE DATABASE Bookstore_DB 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_general_ci;

-- 4. 이제부터 모든 작업은 이 서점 방 안에서 하겠다고 선언합니다.
USE Bookstore_DB;

-- 5. 회원(MEMBER) 테이블을 만듭니다.
CREATE TABLE MEMBER (
    member_id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);