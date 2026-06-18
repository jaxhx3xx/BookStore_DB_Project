USE Bookstore_DB;

-- ========================================================
-- 2. 기존 테이블 초기화 (의존성 관계를 고려하여 자식부터 순서대로 안전하게 삭제)
-- ========================================================
DROP TABLE IF EXISTS ORDER_DETAIL;
DROP TABLE IF EXISTS ORDERS;
DROP TABLE IF EXISTS BOOK;
DROP TABLE IF EXISTS MEMBER;


-- ========================================================
-- 3. MEMBER (회원 테이블)
-- ========================================================
CREATE TABLE MEMBER (
    member_id VARCHAR(50) PRIMARY KEY,                    -- 회원 아이디 (기본키)
    password VARCHAR(255) NOT NULL,                       -- 비밀번호 (필수)
    name VARCHAR(50) NOT NULL,                            -- 이름 (필수)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP         -- 가입일시 (자동 현재시간 저장)
);


-- ========================================================
-- 4. BOOK (도서 테이블)
-- ========================================================
CREATE TABLE BOOK (
    book_id INT PRIMARY KEY AUTO_INCREMENT,               -- 도서 고유 번호 (자동 증가 기본키)
    title VARCHAR(100) NOT NULL,                          -- 도서명 (필수)
    author VARCHAR(50) NOT NULL,                          -- 저자 (필수)
    price INT NOT NULL CHECK (price >= 0),                -- 현재 판매가 (0원 이상만 허용하는 CHECK 제약)
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),      -- 현재 재고 (음수 재고 방지 CHECK 제약)
    published_date DATE NOT NULL                          -- 출판일 (필수 입력 항목)
);


-- ========================================================
-- 5. ORDERS (주문 테이블)
-- ========================================================
CREATE TABLE ORDERS (
    order_id INT PRIMARY KEY AUTO_INCREMENT,              -- 주문 번호 (자동 증가 기본키)
    member_id VARCHAR(50),                                -- 주문한 회원 ID (외래키)
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- 주문 일자 (자동 현재시간 저장)
    
    -- [타당성 포인트] 회원 탈퇴 시 주문 내역의 ID만 NULL로 바꾸고, 매출 데이터(ORDERS) 자체는 보존함
    FOREIGN KEY (member_id) REFERENCES MEMBER(member_id) ON DELETE SET NULL
);


-- ========================================================
-- 6. ORDER_DETAIL (주문 상세 테이블)
-- ========================================================
CREATE TABLE ORDER_DETAIL (
    order_id INT,                                         -- 주문 번호 (외래키)
    book_id INT,                                          -- 도서 고유 번호 (외래키)
    quantity INT NOT NULL CHECK (quantity > 0),           -- 주문 수량 (최소 1권 이상만 가능한 CHECK 제약)
    order_price INT NOT NULL CHECK (order_price >= 0),    -- 주문 당시 실제 결제 가격 (추후 도서가 변동 대비)
    
    -- [타당성 포인트] 주문번호+도서번호를 묶어 '복합 기본키'로 지정하여 한 주문 내에 같은 책이 중복 등록되는 버그 차단 똑같은 주문번호 안에서 똑같은 책을 살 수 없음 그렇다면 수량을 수정하면 되는 것임
    PRIMARY KEY (order_id, book_id),
    
    -- [타당성 포인트] 주문서(ORDERS)가 취소/삭제되면 그에 딸린 상세 영수증 찌꺼기들도 연쇄적으로 자동 삭제됨
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES BOOK(book_id)
);
-- 장바구니 진짜 테이블 생성
CREATE TABLE CART (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    title VARCHAR(255),
    price INT,
    quantity INT DEFAULT 1,
    FOREIGN KEY (book_id) REFERENCES BOOK(book_id)
);