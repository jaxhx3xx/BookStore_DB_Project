require("dotenv").config(); // 💡 .env 파일의 비밀번호를 읽어오는 마법의 코드!
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const app = express();
const PORT = 3000;

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

db.connect((err) => {
  if (err) {
    console.error(" MySQL 연결 실패!! .env 파일의 비번을 확인하세요:", err);
    return;
  }
  console.log(" MySQL Bookstore_DB 연결 성공!");
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

app.listen(PORT, () => {
  console.log(
    `웹 서버가 http://localhost:${PORT} 에서 활기차게 돌아가고 있습니다!`,
  );
});
