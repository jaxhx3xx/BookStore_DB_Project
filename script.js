// ==========================================
// 1. 초기 더미 데이터 (DB 연결 시 대체될 부분)
// ==========================================

// [Members 테이블 역할]
const mockUser = {
  member_id: "user01",
  name: "홍길동",
  email: "hong@example.com",
  phone: "010-1234-5678",
};

// [Book 테이블 역할]
const mockBooks = [
  { book_id: 1, title: "불편한 편의점", author: "김호연", price: 14000 },
  { book_id: 2, title: "모순", author: "양귀자", price: 13000 },
  { book_id: 3, title: "데미안", author: "헤르만 헤세", price: 12000 },
  { book_id: 4, title: "미움받을 용기", author: "기시미 이치로", price: 15000 },
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
function loadBooks() {
  const bookListContainer = document.getElementById("book-list");
  bookListContainer.innerHTML = "";

  /* [DB 연동 필요] 
       fetch('/api/books')
         .then(res => res.json())
         .then(data => { ... })
    */

  mockBooks.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
            <div class="book-img">📖 도서 이미지</div>
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="book-price">${book.price.toLocaleString()}원</div>
            <button class="btn-add-cart" onclick="addToCart(${book.book_id})">장바구니 담기</button>
        `;
    bookListContainer.appendChild(card);
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

  alert(
    "주문이 완료되었습니다! (DB의 ORDERS 및 ORDERS_DETAIL 테이블에 저장될 시점)",
  );

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
