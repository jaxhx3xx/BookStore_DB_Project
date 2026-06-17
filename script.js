// ==========================================
// 1. 초기 더미 데이터 (DB 연결 시 대체될 부분)
// ==========================================

// [Members 테이블 역할]
const mockUser = {
  member_id: "user03",
  name: "정재희",
  email: "Jeong@google.com",
  phone: "010-1234-5678",
};

// [Book 테이블 역할]
// [Book 테이블 역할 - 총 8권으로 풍성하게 업그레이드!]
const mockBooks = [
  {
    book_id: 1,
    title: "불편한 편의점",
    author: "김호연",
    price: 14000,
    img: "",
  },
  { book_id: 2, title: "모순", author: "양귀자", price: 13000, img: "" },
  { book_id: 3, title: "데미안", author: "헤르만 헤세", price: 12000, img: "" },
  {
    book_id: 4,
    title: "미움받을 용기",
    author: "기시미 이치로",
    price: 15000,
    img: "",
  },
  {
    book_id: 5,
    title: "혼자 공부하는 자바",
    author: "신용권",
    price: 28000,
    img: "",
  },
  {
    book_id: 6,
    title: "달러구트 꿈 백화점",
    author: "이미예",
    price: 13800,
    img: "",
  },
  {
    book_id: 7,
    title: "부자 아빠 가난한 아빠",
    author: "로버트 기요사키",
    price: 17000,
    img: "",
  },
  {
    book_id: 8,
    title: "미드나잇 라이브러리",
    author: "매트 헤이그",
    price: 15800,
    img: "",
  },
];

// [Orders & Orders_Detail 테이블 역할 (과거 주문 내역 조회용)]
const mockOrderHistory = [
  {
    order_id: "ORD-20260603-01",
    order_date: "2026-06-03",
    total_price: 27000,
    details: [
      { title: "불편한 편의점", quantity: 1 },
      { title: "모순", quantity: 1 },
    ],
  },
];

// 장바구니 상태 (현재 세션 내에서 유지)
let cart = [];

// ==========================================
// 2. 화면 초기화 및 탭 전환
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  loadUserProfile();
  loadOrderHistory();
});

function switchTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");
}

// ==========================================
// 3. 기능 구현 및 DB 연동 포인트
// ==========================================

// [Book 테이블 데이터 로드]
// [Book 테이블 데이터 로드]
// [Book 테이블 데이터 로드 - 진짜 DB 연동 버전! 🚀]
function loadBooks() {
  const bookListContainer = document.getElementById("book-list");
  bookListContainer.innerHTML = "";

  // 가짜 mockBooks 대신, 서버(app.js)를 통해 MySQL에서 실시간으로 책 8권 긁어오기!
  fetch("/api/books")
    .then((response) => response.json())
    .then((books) => {
      console.log("디비에서 긁어온 진짜 책 데이터:", books);

      // 정재희님이 짜두신 완벽한 화면 그리기 로직 그대로 작동!
      books.forEach((book) => {
        const card = document.createElement("div");
        card.className = "book-card";

        const imageDOM = book.img
          ? `<img src="${book.img}" alt="${book.title}" class="book-img-src" style="width:100%; height:150px; object-fit:cover; border-radius:8px;">`
          : `<div class="book-img" style="height:150px; background:#f1f2f6; display:flex; align-items:center; justify-content:center; border-radius:8px; color:#7f8c8d;">📖 도서 이미지</div>`;

        card.innerHTML = `
            ${imageDOM}
            <div class="book-title" style="font-weight:bold; margin-top:10px;">${book.title}</div>
            <div class="book-author" style="color:#7f8c8d; font-size:0.9rem;">${book.author}</div>
            <div class="book-price" style="font-weight:bold; color:#2c3e50; margin:5px 0;">${book.price.toLocaleString()}원</div>
            <button class="btn-add-cart" onclick="addToCart(${book.book_id})">장바구니 담기</button>
        `;
        bookListContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("책 데이터를 가져오는데 실패했어요 😭", error);
      bookListContainer.innerHTML =
        "<p style='color:red;'>도서 목록을 불러오는 중 오류가 발생했습니다.</p>";
    });
}

// [장바구니 추가]
function addToCart(bookId) {
  const book = mockBooks.find((b) => b.book_id === bookId);
  const cartItem = cart.find((item) => item.book_id === bookId);

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ ...book, quantity: 1 });
  }

  alert(`${book.title}이(가) 장바구니에 담겼습니다.`);
  updateCartUI();
}

// [장바구니 UI 업데이트]
function updateCartUI() {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPriceEl = document.getElementById("total-price");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-msg">장바구니가 비어 있습니다.</p>';
    totalPriceEl.innerText = "0원";
    return;
  }

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
            <div>
                <div style="font-weight:bold;">${item.title}</div>
                <div style="color:#7f8c8d; font-size:0.9rem;">${item.price.toLocaleString()}원 x ${item.quantity}개</div>
            </div>
            <div style="font-weight:bold; color:#e74c3c;">${(item.price * item.quantity).toLocaleString()}원</div>
        `;
    cartItemsContainer.appendChild(div);
  });

  totalPriceEl.innerText = `${total.toLocaleString()}원`;
}

// [주문하기 클릭 -> ORDERS 및 ORDERS_DETAIL 테이블 입력 생성]
function checkout() {
  if (cart.length === 0) {
    alert("장바구니가 비어있습니다.");
    return;
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const orderData = {
    member_id: "Jeong",
    items: cart.map((item) => ({
      book_id: item.book_id,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  /* [DB 연동 필요] 
       1. ORDERS 테이블에 insert (member_id, total_price, order_date 등)
       2. 방금 생성된 order_id를 가지고 ORDERS_DETAIL 테이블에 각 아이템 insert (order_id, book_id, quantity, price)
       
       예시 body 데이터 구조:
       const orderData = {
           member_id: mockUser.member_id,
           total_price: totalPrice,
           items: cart.map(item => ({ book_id: item.book_id, quantity: item.quantity, price: item.price }))
       };
    */

  fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.error(error);
      alert("주문 실패");
    });

  // 임시 주문 내역 반영 및 장바구니 비우기
  mockOrderHistory.unshift({
    order_id: `ORD-${Date.now()}`,
    order_date: new Date().toISOString().split("T")[0],
    total_price: totalPrice,
    details: cart.map((item) => ({
      title: item.title,
      quantity: item.quantity,
    })),
  });

  cart = [];
  updateCartUI();
  loadOrderHistory();
  switchTab("tab-mypage");
}

// [Members 회원 정보 로드]
function loadUserProfile() {
  const userInfoContainer = document.getElementById("user-info");

  /* [DB 연동 필요] 
       fetch(`/api/members/${mockUser.member_id}`)
    */

  userInfoContainer.innerHTML = `
        <div class="profile-line"><strong>아이디:</strong> ${mockUser.member_id}</div>
        <div class="profile-line"><strong>이름:</strong> ${mockUser.name}</div>
        <div class="profile-line"><strong>이메일:</strong> ${mockUser.email}</div>
        <div class="profile-line"><strong>연락처:</strong> ${mockUser.phone}</div>
    `;
}

// [Orders & Orders_Detail 주문 내역 로드]
function loadOrderHistory() {
  const orderListContainer = document.getElementById("order-list");
  orderListContainer.innerHTML = "";

  /* [DB 연동 필요] 
       ORDERS 테이블과 ORDERS_DETAIL 테이블을 JOIN하여 해당 유저의 주문 이력을 가져옴
       fetch(`/api/orders?member_id=${mockUser.member_id}`)
    */

  if (mockOrderHistory.length === 0) {
    orderListContainer.innerHTML =
      '<p style="color:#7f8c8d;">주문 내역이 없습니다.</p>';
    return;
  }

  mockOrderHistory.forEach((order) => {
    const itemsText = order.details
      .map((d) => `${d.title} (${d.quantity}개)`)
      .join(", ");

    const div = document.createElement("div");
    div.className = "order-item";
    div.innerHTML = `
            <div class="order-header">
                <span>주문번호: ${order.order_id}</span>
                <span>날짜: ${order.order_date}</span>
            </div>
            <div style="font-weight:bold; margin-bottom:8px;">${itemsText}</div>
            <div style="text-align:right; color:#212529; font-weight:bold;">총 결제금액: ${order.total_price.toLocaleString()}원</div>
        `;
    orderListContainer.appendChild(div);
  });
}
