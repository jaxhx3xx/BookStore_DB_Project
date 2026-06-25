console.log("ROUTES LOADING CHECK");

require("dotenv").config(); // 💡 .env 파일의 비밀번호를 읽어오는 마법의 코드!
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const app = express();
const PORT = 3000;

app.get("/test", (req, res) => {
  console.log("TEST HIT");
  res.send("TEST OK");
});

// 💡 [버그 수정 1] 주석을 해제하여 HTML, JS 파일들을 웹에 다시 개방합니다!
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ==========================================
// 1.schema.sql에서 USE Bookstore_DB로 만든 DB에 Node.js가 접속하는 부분.
// ==========================================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "Bookstore_DB",
});

console.log("★★★★ 최신 app.js 실행됨 ★★★★");

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL 연결 실패!! .env 파일의 비번을 확인하세요:", err);
    return;
  }
  console.log("🚀 MySQL Bookstore_DB 연결 성공!");
});

// BOOK 테이블의 모든 행을 가져와요. data.sql에서 INSERT한 책 8권이 여기서 조회가능
app.get("/api/books", (req, res) => {
  db.query("SELECT * FROM BOOK", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

{
  /* <select코드>

페이지 접속
    ↓
main.js가 /api/books 주소로 요청
    ↓
app.js가 요청 받음 (app.get 실행)
    ↓
MySQL에 SELECT * FROM BOOK 실행
    ↓
책 8권 데이터가 results에 담김
    ↓
res.json(results)으로 main.js에 전달
    ↓
화면에 책 카드 8개 표시! */
}

// [주문하기 처리 API]
app.post("/api/orders", (req, res) => {
  const { member_id, items } = req.body;
  db.query(
    "INSERT INTO ORDERS (member_id) VALUES (?)", // 일단 ORDERS 테이블에 주문을 먼저 저장
    [member_id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      const newOrderId = result.insertId;
      const detailValues = items.map((item) => [
        newOrderId,
        item.book_id,
        item.quantity,
        item.price,
      ]);
      const sql =
        "INSERT INTO ORDER_DETAIL (order_id, book_id, quantity, order_price) VALUES ?"; //ORDERS_DETAIL 테이블에 상세 내역 저장
      db.query(sql, [detailValues], (err) => {
        if (err) return res.status(500).send(err);
        res.json({
          success: true,
          message: "주문이 DB에 완벽히 저장되었습니다!",
          order_id: newOrderId,
        });
      });
    },
  );
});

// ==========================================
// 4. [DB 연동 포인트] 특정 회원의 주문 상세 내역 조회 API (수행평가 만점용 JOIN 🔥)
// 💡 [버그 수정 2] 중복되던 기존 반쪽짜리 API를 과감히 지우고 JOIN 버전만 남겼습니다!
// ==========================================
app.get("/api/orders/:memberId", (req, res) => {
  const { memberId } = req.params;
  console.log("HIT ORDERS JOIN API:", memberId);

  const sql = `
    SELECT 
      o.order_id,  
      o.order_date,
      b.title AS book_title,
      od.quantity,
      od.order_price
    FROM ORDERS o
    JOIN ORDER_DETAIL od ON o.order_id = od.order_id
    JOIN BOOK b ON od.book_id = b.book_id
    WHERE o.member_id = ?
    ORDER BY o.order_date DESC
  `;
  //   마이페이지 탭 클릭 or 주문 완료 후
  //         ↓
  // script.js가 /api/orders/Jeong 주소로 요청
  //         ↓
  // app.js의 이 코드가 실행됨!

  /*FROM ORDERS o                          -- ORDERS를 'o'라는 별명으로 시작
  JOIN ORDER_DETAIL od                   -- ORDER_DETAIL을 'od'로
    ON o.order_id = od.order_id          -- 두 테이블의 order_id가 같은 행끼리 연결
  JOIN BOOK b                            -- BOOK을 'b'로
    ON od.book_id = b.book_id            -- ORDER_DETAIL의 book_id로 BOOK과 연결
  WHERE o.member_id = ?                  -- 특정 회원 것만 필터링 ('Jeong')
  ORDER BY o.order_date DESC             -- 최신 주문이 맨 위로 */

  /*테이블 3개(ORDERS, ORDER_DETAIL, BOOK)를 JOIN으로 한 번에 합쳐요.
  ORDERS ↔ ORDER_DETAIL : order_id로 연결
  ORDER_DETAIL ↔ BOOK : book_id로 연결
  결과적으로 "누가, 언제, 어떤 책을, 몇 권, 얼마에 샀는지" 한 줄로 나와요. */

  db.query(sql, [memberId], (err, results) => {
    if (err) {
      console.error("❌ 주문 내역 조회 실패:", err);
      return res.status(500).send(err);
    }
    res.json(results); // 조인된 꽉 찬 데이터를 프론트엔드로 전송!
  });
});

// 1. 서버 실행 (그대로 유지)
app.listen(PORT, () => {
  console.log(
    `웹 서버가 http://localhost:${PORT} 에서 활기차게 돌아가고 있습니다!`,
  );
});

// 2. 🛒 [POST] 장바구니 진짜 MySQL 저장 API (위로 끌어올림 ⭐)
app.post("/api/cart", (req, res) => {
  const { book_id, title, price } = req.body;
  const sql =
    "INSERT INTO CART (book_id, title, price, quantity) VALUES (?, ?, ?, 1)";
  //schema.sql에서 만든 CART 테이블에 책 정보를 저장해요. 수량은 기본값 1로 시작해요.

  db.query(sql, [book_id, title, price], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "장바구니 디비 저장 실패" });
    }
    res.json({ message: `${title}이(가) 진짜 MySQL 장바구니에 담겼습니다!` });
  });
});

{
  /* <insert 코드>
"장바구니 담기" 버튼 클릭
        ↓
script.js가 book_id, title, price를 app.js로 전송
        ↓
app.js가 req.body에서 3개 꺼냄
        ↓
? 빈칸에 값 채워서 SQL 실행
        ↓
CART 테이블에 한 행 추가됨 */
}

// 3. 장바구니 영구 삭제 API (book_id 기준으로 매칭하여 완벽 삭제! 🗑️)
app.delete("/api/cart/:book_id", (req, res) => {
  const { book_id } = req.params;

  // 💡 SQL문을 CART 테이블의 book_id를 조준하도록 수정했습니다!
  const sql = "DELETE FROM CART WHERE book_id = ?";
  //book_id를 기준으로 CART 테이블에서 해당 행을 삭제해요.

  db.query(sql, [book_id], (err, result) => {
    if (err) {
      console.error("디비 삭제 에러:", err);
      return res.status(500).json({ error: "삭제 실패" });
    }
    res.json({ message: "장바구니에서 성공적으로 삭제되었습니다!" });
  });
});
{
  /* <delete 코드> 

장바구니에서 ❌ 삭제 버튼 클릭 (book_id = 2)
        ↓
script.js가 /api/cart/2 주소로 DELETE 요청
        ↓
app.js가 req.params에서 book_id = 2 꺼냄
        ↓
? 빈칸에 2 채워서 SQL 실행 */
}

// 4. 🚨 [404 에러 처리반] 모든 API 매칭이 실패했을 때만 작동하도록 맨 밑으로 이동!!
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) {
    console.log("NOT FOUND API:", req.url);
    return res.status(404).send("NO ROUTE");
  }
  next();
});
