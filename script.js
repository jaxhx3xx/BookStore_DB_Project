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

// [Book 테이블 역할 - 총 8권]
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

// 🟢 장바구니 상태 (브라우저 금고인 localStorage와 실시간 연동! 🛡️)
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ==========================================
// 2. 화면 초기화 및 탭 전환
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  loadUserProfile();
  loadOrderHistory();
  updateCartUI(); // 💡 새로고침 시 화면 즉시 복구용
});

function switchTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  if (event && event.target) {
    event.target.classList.add("active");
  }
}

// ==========================================
// 3. 기능 구현 및 DB 연동 포인트
// ==========================================

// [Book 테이블 데이터 로드 - 진짜 DB 연동 버전! 🚀]
function loadBooks() {
  const bookListContainer = document.getElementById("book-list");
  if (!bookListContainer) return;
  bookListContainer.innerHTML = "";

  //app.js의 SELECT * FROM BOOK 결과를 받아서 화면에 카드로 그림
  fetch("/api/books")
    .then((response) => response.json())
    .then((books) => {
      console.log("디비에서 긁어온 진짜 책 데이터:", books);
      window.currentBooks = books;

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

// [장바구니 추가 -> 진짜 MySQL 디비 전송 및 실시간 새로고침! 🚀]
function addToCart(bookId) {
  const book = (window.currentBooks || []).find((b) => b.book_id === bookId);
  if (!book) return;

  //app.js의 INSERT INTO CART를 호출해요. 성공하면 localStorage에도 저장해서 새로고침해도 유지돼요.
  fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      book_id: book.book_id,
      title: book.title,
      price: book.price,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message); // "~이 진짜 MySQL 장바구니에 담겼습니다!"

      // 💡 [여기 딱 한 줄 추가했습니다! ⭐] 디비 전송 성공 시 화면용 메모리 배열(cart)에도 추가해 줍니다.
      const existingItem = cart.find((item) => item.book_id === bookId);
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        cart.push({
          book_id: book.book_id,
          title: book.title,
          price: book.price,
          quantity: 1,
        });
      }

      // 💡 [여기 딱 한 줄 추가했습니다! ⭐] 새로고침(reload)해도 유지되도록 브라우저 금고에 값을 임시 저장해 둡니다.
      localStorage.setItem("cart", JSON.stringify(cart));

      // 디비에 새로 저장되었으니 원래 코드 스타일대로 실시간 새로고침!
      location.reload();
    })
    .catch((error) => {
      console.error("장바구니 디비 전송 에러:", error);
      alert("장바구니 담기 중 오류가 발생했습니다.");
    });
}

// [장바구니 UI 업데이트 - 진짜 디비 cart_id 연동 및 삭제 버튼 강제 활성화 버전! ❌]
function updateCartUI() {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPriceEl = document.getElementById("total-price");

  if (!cartItemsContainer || !totalPriceEl) return;

  // 1. 장바구니가 완전히 비어있을 때 처리
  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-msg">장바구니가 비어 있습니다.</p>';
    totalPriceEl.innerText = "0원";
    localStorage.setItem("cart", JSON.stringify(cart));
    return;
  }

  // 2. 장바구니에 물건이 있을 때 화면에 그리기
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.className = "cart-item";

    // 💡 item.cart_id 또는 item.book_id를 안전하게 매칭하여 삭제 버튼(❌)을 화면에 확실히 띄웁니다!
    const deleteId = item.cart_id || item.book_id;

    div.innerHTML = `
            <div style="flex: 1; display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #f1f2f6;">
                <div>
                    <div style="font-weight:bold; font-size:1rem; color:#2c3e50;">${item.title}</div>
                    <div style="color:#7f8c8d; font-size:0.9rem; margin-top:3px;">${item.price.toLocaleString()}원 x ${item.quantity}개</div>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-weight:bold; color:#e74c3c; font-size:1.1rem;">${(item.price * item.quantity).toLocaleString()}원</div>
                    <button onclick="removeFromCart(${deleteId})" style="background: #ef5757; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; font-size: 0.85rem; font-weight: bold;">삭제</button>
                </div>
            </div>
        `;
    cartItemsContainer.appendChild(div);
  });

  totalPriceEl.innerText = `${total.toLocaleString()}원`;
  localStorage.setItem("cart", JSON.stringify(cart));
}

// [주문하기 클릭 -> ORDERS 및 ORDER_DETAIL 테이블 진짜 저장 🚀]
function checkout() {
  if (cart.length === 0) {
    alert("장바구니가 비어있습니다.");
    return;
  }

  const orderData = {
    member_id: "Jeong",
    items: cart.map((item) => ({
      book_id: item.book_id,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  /* app.js의 INSERT INTO ORDERS → INSERT INTO ORDER_DETAIL 2단계를 순서대로 실행시켜요.
  member_id: "Jeong"은 data.sql에서 INSERT한 회원이에요. */
  fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("서버 응답 고장!");
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);

      // 주문 완료 시에만 금고 폭파하고 장바구니 비우기!
      cart = [];
      updateCartUI();
      localStorage.removeItem("cart");

      try {
        loadOrderHistory();
        switchTab("tab-mypage");
      } catch (uiError) {
        console.log(uiError);
      }
    })
    .catch((error) => {
      console.error(error);
      alert("주문 실패");
    });
}

// [Members 회원 정보 로드]
function loadUserProfile() {
  const userInfoContainer = document.getElementById("user-info");
  if (!userInfoContainer) return;

  userInfoContainer.innerHTML = `
        <div class="profile-line"><strong>아이디:</strong> ${mockUser.member_id}</div>
        <div class="profile-line"><strong>이름:</strong> ${mockUser.name}</div>
        <div class="profile-line"><strong>이메일:</strong> ${mockUser.email}</div>
        <div class="profile-line"><strong>연락처:</strong> ${mockUser.phone}</div>
    `;
}

// [Orders & Order_Detail 주문 내역 로드 - 진짜 DB JOIN 버전! 🔥]
function loadOrderHistory() {
  const orderListContainer = document.getElementById("order-list");
  if (!orderListContainer) return;
  orderListContainer.innerHTML = "<p>주문 내역을 불러오는 중... 🔄</p>";

  const memberId = "Jeong";

  fetch(`/api/orders/${memberId}`)
    .then((response) => response.json())
    .then((orders) => {
      console.log("디비에서 JOIN으로 가져온 주문 상세 내역:", orders);

      if (!orders || orders.length === 0) {
        orderListContainer.innerHTML =
          '<p style="color:#7f8c8d; text-align:center;">주문 내역이 없습니다. 🛒</p>';
        return;
      }

      orderListContainer.innerHTML = "";

      orders.forEach((order) => {
        const orderDate = new Date(order.order_date).toLocaleString("ko-KR");
        const totalPrice = order.order_price * order.quantity;

        const div = document.createElement("div");
        div.className = "order-item";
        div.style =
          "border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #fff;";
        div.innerHTML = `
            <div class="order-header" style="display:flex; justify-content:space-between; border-bottom:1px solid #f5f5f5; padding-bottom:8px; margin-bottom:8px; font-size:0.9rem; color:#7f8c8d;">
                <span>🆔 주문번호: <strong>${order.order_id}</strong></span>
                <span>📅 날짜: ${orderDate}</span>
            </div>
            <div style="font-weight:bold; margin-bottom:8px; font-size:1.1rem; color:#2c3e50;">📖 ${order.book_title}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; color:#7f8c8d;">
               <span>수량: ${order.quantity}개 (단가: ${order.order_price.toLocaleString()}원)</span>
               <span style="text-align:right; color:#e74c3c; font-weight:bold; font-size:1.1rem;">결제 금액: ${totalPrice.toLocaleString()}원</span>
            </div>
        `;
        orderListContainer.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("주문 내역 로드 에러:", error);
      orderListContainer.innerHTML =
        '<p style="color:red;">주문 내역을 불러오는 중 오류가 발생했습니다.</p>';
    });
}

// ❌ 장바구니 화면에서 삭제 버튼 누르면 디비와 브라우저 메모리 둘 다 지우는 함수
function removeFromCart(cartId) {
  if (!cartId) {
    alert("삭제할 장바구니 번호표(cart_id)를 찾을 수 없습니다.");
    return;
  }

  if (
    !confirm(
      "장바구니에서 이 책을 진짜 삭제하시겠습니까? (DB 데이터가 삭제됩니다)",
    )
  ) {
    return;
  }

  // 1. 백엔드로 DELETE 신호 보내기
  fetch(`/api/cart/${cartId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message); // "장바구니에서 성공적으로 삭제되었습니다!"

      // 💡 디비에서 지워졌으니, 화면을 그리는 브라우저 cart 배열에서도 이 책을 제거합니다!
      cart = cart.filter((item) => (item.cart_id || item.book_id) !== cartId);

      // 2. 바뀐 메모리 데이터를 로컬스토리지에 저장하고 화면을 새로 그립니다!
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartUI();
    })
    .catch((error) => {
      console.error("삭제 에러:", error);
      alert("삭제 중 오류가 발생했습니다.");
    });
}
