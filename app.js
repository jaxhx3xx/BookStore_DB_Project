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
// 1. MySQL 데이터베이스 연결 설정
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

// [도서 목록 조회 API]
app.get("/api/books", (req, res) => {
  db.query("SELECT * FROM BOOK", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// [주문하기 처리 API]
app.post("/api/orders", (req, res) => {
  const { member_id, items } = req.body;
  db.query(
    "INSERT INTO ORDERS (member_id) VALUES (?)",
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
        "INSERT INTO ORDER_DETAIL (order_id, book_id, quantity, order_price) VALUES ?";
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

  db.query(sql, [book_id, title, price], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "장바구니 디비 저장 실패" });
    }
    res.json({ message: `${title}이(가) 진짜 MySQL 장바구니에 담겼습니다!` });
  });
});

// 3. 🗑️ [DELETE] 장바구니 영구 삭제 API (위로 끌어올림 ⭐)
app.delete("/api/cart/:cart_id", (req, res) => {
  const { cart_id } = req.params;
  const sql = "DELETE FROM CART WHERE cart_id = ?";

  db.query(sql, [cart_id], (err, result) => {
    if (err) return res.status(500).json({ error: "삭제 실패" });
    res.json({ message: "장바구니에서 성공적으로 삭제되었습니다!" });
  });
});

// 4. 🚨 [404 에러 처리반] 모든 API 매칭이 실패했을 때만 작동하도록 맨 밑으로 이동!!
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) {
    console.log("NOT FOUND API:", req.url);
    return res.status(404).send("NO ROUTE");
  }
  next();
});
