USE Bookstore_DB;



-- ========================================================
-- 3. MEMBER (회원 테이블)
-- ========================================================
CREATE TABLE MEMBER (
    member_id VARCHAR(50) PRIMARY KEY,                    -- 회원 아이디 (기본키=중복불가)
    password VARCHAR(255) NOT NULL,                       -- 비밀번호 (필수) 넉넉하게 공간 잡기 -> 나증에 암호회 된 긴 비번도 저장 가능 
    name VARCHAR(50) NOT NULL,                            -- 이름 (필수) 이름 없이는 가입 불가 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP         -- 가입일시 (자동 현재시간 저장) 따로 안 넣어도 가입 시각이 자동 저장됨 
);


-- ========================================================
-- 4. BOOK (도서 테이블)
-- ========================================================
CREATE TABLE BOOK (
    book_id INT PRIMARY KEY AUTO_INCREMENT,               -- 도서 고유 번호 (자동 증가 기본키) INSERT 할 때 번호 자동 부여 
    title VARCHAR(100) NOT NULL,                          -- 도서명 (필수) 
    author VARCHAR(50) NOT NULL,                          -- 저자 (필수)
    price INT NOT NULL CHECK (price >= 0),                -- 현재 판매가 (0원 이상만 허용하는 CHECK 제약) 음수 방지 
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
    /*회원을 지워도 주문 기록(매출 데이터)은 살아있어야 하니까 SET NULL을 쓴 거예요.
    CASCADE였으면 회원 탈퇴 시 주문 내역까지 다 같이 지워져서 매출 기록이사라지면 안되기 때문에 
    */
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
    /*복합키가 사용되야 하는 이유는 복합키가 없을 때 있던 책을 또 등록하면 등록이 되는데
    복합키를 하면 등록을 해도 버그가 생기기 때문에 막을 수 있음 */

    /*외래키 2개 동작 방식이
    ORDERS(order_id=1) 삭제
        ↓ ON DELETE CASCADE
    ORDER_DETAIL의 order_id=1인 행 자동 삭제 

    BOOK(book_id=1) 삭제 시도
        ↓ CASCADE 없음
    ORDER_DETAIL에 book_id=1이 있으면 삭제 거부! 
    (판매 기록이 있는 책은 함부로 못 지우게 보호)
    */

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
/*quantity DEFAULT 1 → 장바구니에 담을 때 수량을 따로 안 보내도 기본 1개로 시작해요.
book_id로 BOOK 테이블과 연결돼있어서 존재하지 않는 책은 장바구니에 못 담아요.
*/