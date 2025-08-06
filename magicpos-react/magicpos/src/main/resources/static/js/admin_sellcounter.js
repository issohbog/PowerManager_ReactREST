function openAdminsellcounter() {
  const modal = document.getElementById("adminsellcounter");
  if (modal) {
    modal.style.display = "flex";
    loadCategoriesToSelect() // 카테고리 불러오기
    loadProductsToModal(); // 상품 불러오기
    loadCartItems();
  }
}

function closeAdminsellcounter() {
  const modal = document.getElementById("adminsellcounter");
  if (modal) {
    modal.style.display = "none";
  }
}

// 카테고리 불러오기
function loadCategoriesToSelect() {
  fetch("/admin/categories/json")
    .then(res => res.json())
    .then(categories => {
      const select = document.querySelector("select[name='category']");
      if (!select) return;

      select.innerHTML = `<option value="">카테고리 전체</option>`; // 초기화

      categories.forEach(c => {
        const option = document.createElement("option");
        option.value = c.no;
        option.textContent = c.cname;
        select.appendChild(option);
      });
    })
    .catch(err => console.error("❌ 카테고리 불러오기 실패:", err));
}

categorySelect.addEventListener("change", () => {
  const category = categorySelect.value;
  const keyword = document.querySelector("input[name='keyword']").value.trim(); // 현재 입력된 검색어도 같이
  loadProductsToModal(keyword, category); // 👉 필터링하려면 반드시 넘겨줘야 해!
});




// 상품 목록 불러오기
function loadProductsToModal(keyword = "", category = "") {
  let url = "/admin/products/json";
  const params = [];
  
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  
  console.log("✅ 검색어:", keyword);
  console.log("✅ 카테고리:", category);
  if (params.length > 0) url += "?" + params.join("&");

  fetch(url)
    .then(res => res.json())
    .then(productList => {
      const tbody = document.getElementById("productTableBody");
      tbody.innerHTML = "";

      if (!productList || productList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">😢 상품이 없습니다</td></tr>`;
        return;
      }

      productList.forEach(product => {
        const row = `
          <tr>
            <td>${product.no}</td>
            <td>${product.categoryName}</td>
            <td>${product.pName}</td>
            <td>${product.stock}개</td>
            <td>${product.pPrice.toLocaleString()}원</td>
            <td>
              <button class="cart-add-btn" data-pno="${product.no}">
                <img src="/images/회색 플러스.png" alt="담기" />
              </button>
            </td>
          </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
      });
    });
}

document.querySelector(".search-box").addEventListener("submit", (e) => {
  e.preventDefault();
  const keyword = e.target.querySelector("input[name='keyword']").value.trim();
  const category = e.target.querySelector("select[name='category']").value;
  loadProductsToModal(keyword, category);
});




// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openAdminSellCounterModalBtn");
  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openAdminsellcounter(); // 모달 열기 + 상품 불러오기
    });
  }


document.addEventListener("click", (e) => {
  const btn = e.target.closest(".cart-add-btn");
  if (btn) {
    const pno = btn.dataset.pno;

    const csrfToken = document.querySelector('meta[name="_csrf"]').content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

    
    // 👉 fetch로 장바구니 추가  요청
    fetch("/admin/sellcounter/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        [csrfHeader]: csrfToken, // 💡 csrf 처리 필수
      },
      body: new URLSearchParams({
        pNo: pno
      })
    })
      .then(res => {
        if (res.ok) {
          loadCartItems();
        } else {
          alert("❌ 장바구니 추가 실패");
        }
      })
      .catch(err => {
        console.error("장바구니 담기 에러:", err);
      });
  }
});
});
function loadCartItems() {
  console.log("🛒 loadCartItems() 실행됨!");
  fetch("/admin/orders/cart/json")
    .then(res => res.json())
    .then(cartList => {
      const cartContainer = document.querySelector(".sell-cart-items");
      const totalPriceElem = document.querySelector(".total-price span");
      cartContainer.innerHTML = "";

      let totalPrice = 0;

      // ✅ 장바구니가 비었으면 안내 문구 출력
      if (!cartList || cartList.length === 0) {
        cartContainer.innerHTML = `
          <div class="empty-cart-message" style="padding: 20px; text-align: center; color: #999;">
            🛒 장바구니가 비어 있습니다.
          </div>
        `;
        totalPriceElem.textContent = "0원";
        return;
      }

      // ✅ 장바구니가 있을 경우 렌더링
      cartList.forEach(cart => {
        const itemHTML = `
        <div class="sell-cart-item">
          <input type="hidden" name="pNo" value="${cart.p_no}" />
          <input type="hidden" name="pName" value="${cart.p_name}">
          <input type="hidden" name="quantity" value="${cart.quantity}" />
          <input type="hidden" name="stock" value="${cart.stock}" />
          <div class="cart-item-left">
            <div>${cart.p_name}</div>
            <div class="quantity-control">
              <form action="/admin/sellcounter/decrease" method="post">
                <input type="hidden" name="pNo" value="${cart.p_no}" />
                <button type="submit" class="sellcontrolBtn">
                  <img src="/images/마이너스 하얀색.png" alt="감소">
                </button>
              </form>
              <span>${cart.quantity}</span>
              <form action="/admin/sellcounter/increase" method="post">
                <input type="hidden" name="pNo" value="${cart.p_no}" />
                <button type="submit" class="sellcontrolBtn">
                  <img src="/images/플러스 노란색.png" alt="증가">
                </button>
              </form>
            </div>
          </div>
          <div class="cart-item-right">
            <div>${(cart.p_price * cart.quantity).toLocaleString()}원</div>
            <form action="/admin/sellcounter/delete" method="post">
              <input type="hidden" name="cNo" value="${cart.no}" />
              <button class="selldeleteBtn">✕</button>
            </form>
          </div>
        </div>
        `;
        totalPrice += cart.p_price * cart.quantity;
        cartContainer.insertAdjacentHTML("beforeend", itemHTML);
      });

      totalPriceElem.textContent = totalPrice.toLocaleString() + "원";
    })
    .catch(err => {
      console.error("❌ 장바구니 로딩 에러:", err);
    });
}


document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('submitOrderBtn');
  const tossPayments = TossPayments("test_ck_ZLKGPx4M3MGPnBZkRAlwrBaWypv1");

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const orderForm = document.getElementById('orderForm');
    const seatId = document.getElementById('seatIdInput').value.trim();
    if (!seatId) return alert("좌석번호를 입력해주세요.");
    document.getElementById("seatIdHidden").value = seatId;

    const paymentMethod = orderForm.querySelector('input[name="payment"]:checked')?.value;
    if (!paymentMethod) return alert("결제 수단을 선택해주세요.");

    const csrfToken = document.querySelector('meta[name="_csrf"]').content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;
    const userNo = document.getElementById("user-no").value;

    const cartItems = document.querySelectorAll('.sell-cart-item');
    if (cartItems.length === 0) return alert("장바구니가 비어있습니다!");

    const pNoList = [], quantityList = [], pNameList = [], stockList = [];
    cartItems.forEach(item => {
      pNoList.push(item.querySelector("input[name='pNo']").value);
      quantityList.push(item.querySelector("input[name='quantity']").value);
      pNameList.push(item.querySelector("input[name='pName']").value);
      stockList.push(item.querySelector("input[name='stock']").value);
    });

    const totalPrice = document.querySelector(".total-price span").textContent.replace("원", "").replace(/,/g, "");

    if (paymentMethod === "현금") {
      const params = new URLSearchParams();
      params.append("seatId", seatId);
      params.append("totalPrice", totalPrice);
      params.append("payment", paymentMethod);
      pNoList.forEach(v => params.append("pNoList", v));
      quantityList.forEach(v => params.append("quantityList", v));
      pNameList.forEach(v => params.append("pNameList", v));
      stockList.forEach(v => params.append("stockList", v));

      const res = await fetch("/admin/sellcounter/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          [csrfHeader]: csrfToken
        },
        body: params
      });

      if (res.ok) {
        alert("✅ 주문이 완료되었습니다!");
        loadCartItems();
      } else {
        alert("❌ 주문 실패");
      }
      return;
    }

    // 카드 결제일 경우
    try {
      // 1. 세션에 주문정보 저장
      const saveRes = await fetch('/admin/orders/temp', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrfHeader]: csrfToken
        },
        body: JSON.stringify({
          seatId,
          pNoList,
          quantityList,
          pNameList,
          stockList,
          totalPrice,
          payment: paymentMethod,
          userNo
        })
      });

      if (!saveRes.ok) throw new Error("세션 저장 실패");

      // 2. 결제 정보 생성
      const payRes = await fetch('/admin/sellcounter/payment-info', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrfHeader]: csrfToken
        },
        body: JSON.stringify({
          seatId,
          pNoList,
          quantityList,
          pNameList,
          stockList,
          totalPrice,
          payment: paymentMethod,
          userNo
        })
      });

      if (!payRes.ok) throw new Error("결제 정보 생성 실패");

      const paymentInfo = await payRes.json();

      // 3. 결제창 호출
      tossPayments.requestPayment(paymentMethod, {
        amount: paymentInfo.amount,
        orderId: paymentInfo.orderId,
        orderName: paymentInfo.orderName,
        customerName: paymentInfo.customerName,
        successUrl: paymentInfo.successUrl,
        failUrl: paymentInfo.failUrl
      });

    } catch (err) {
      console.error("❌ 관리자 결제 처리 중 오류:", err);
      alert("결제 도중 문제가 발생했습니다.");
    }
  });
});



// 수량 변경, 삭제
document.body.addEventListener("click", async (e) => {
  const btn = e.target.closest(".sellcontrolBtn");
  const delBtn = e.target.closest(".selldeleteBtn");

  // CSRF 처리
  const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
  const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

  // ✅ 수량 증가 / 감소
  if (btn) {
    e.preventDefault();
    const form = btn.closest("form");
    const formData = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: {
          [csrfHeader]: csrfToken
        },
        body: formData
      });

      if (res.ok) {
        console.log("✅ 수량 조정 성공!");
        loadCartItems(); // 장바구니만 다시 그려줘!
      } else {
        alert("❌ 수량 조정 실패");
      }
    } catch (err) {
      console.error("❌ 수량 조정 중 오류", err);
      alert("서버 오류 발생!");
    }
  }

  // ❌ 삭제 버튼
  if (delBtn) {
    e.preventDefault();
    const form = delBtn.closest("form");
    const formData = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: {
          [csrfHeader]: csrfToken
        },
        body: formData
      });

      if (res.ok) {
        console.log("🗑️ 삭제 성공!");
        loadCartItems(); // 삭제 후 장바구니 다시 불러오기
      } else {
        alert("❌ 삭제 실패");
      }
    } catch (err) {
      console.error("❌ 삭제 요청 오류", err);
      alert("서버 오류 발생!");
    }
  }
});

// 결제 버튼 클릭 이벤트 등에서 호출
async function saveAdminTempOrder({
    seatId,
    pNoList,
    quantityList,
    pNameList,
    totalPrice,
    payment,
    userNo,
    csrfHeader,
    csrfToken
}) {
    try {
        const response = await fetch('/admin/orders/temp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({
                seatId,
                pNoList,
                quantityList,
                pNameList,
                totalPrice,
                payment,
                userNo
            })
        });
        if (!response.ok) {
            throw new Error('주문 정보 세션 저장 실패');
        }
        // 성공 시 추가 동작(필요시)
        // 예: 결제창 오픈 등
    } catch (err) {
        alert('주문 정보 세션 저장 중 오류 발생: ' + err.message);
        return false;
    }
    return true;
}


