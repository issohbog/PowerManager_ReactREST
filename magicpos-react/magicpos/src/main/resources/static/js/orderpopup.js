console.log("📦 orderpopup.js 실행됨");
// 주문현황 or 준비중 탭에서 상태 변경해도 기존 탭 그대로 설정
let lastUsedUrl = "/admin/orderpopup/fetch?status=0";

// 판매취소 -> 모달 열기
function showCancelModal(orderNo) {
  fetch(`/admin/cancel/${orderNo}`)
    .then(res => res.text())
    .then(html => {
      const existing = document.getElementById(`cancel-modal-${orderNo}`);
      if (existing) existing.remove();

      document.body.insertAdjacentHTML("beforeend", html);

      const modal = document.getElementById(`cancel-modal-${orderNo}`);
      if (modal) modal.style.display = 'block';

      initModalEvents();
    });
}
// 판매취소 -> 모달 닫기
function closeCancelModal(orderNo) {
  const modal = document.getElementById(`cancel-modal-${orderNo}`);
  if (modal) {
    modal.remove(); // DOM에서 제거
  }
}


// 준비중, 전달완료 설정
function updateStatus(orderNo, status, el) {
  const formData = new FormData();
  const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
  const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

  formData.append("no", orderNo);
  formData.append("orderStatus", status);

  fetch("/admin/orders/status", {
    method: "POST",
    headers: {
      [csrfHeader]: csrfToken
    },
    body: formData
  })
    .then(res => res.text())
    .then(data => {
      if (data === "ok") {
        console.log("✅ 상태 변경 성공");

        fetch(lastUsedUrl, { cache: "no-store" })
          .then(res => res.text())
          .then(html => {
            document.getElementById("orderPopupContainer").innerHTML = html;

            // 탭 다시 설정
            document.querySelectorAll(".number-tab1, .number-tab2").forEach(el => el.classList.remove("active-tab"));
            const matchingTab = document.querySelector(`a[href='${lastUsedUrl}']`);
            if (matchingTab) matchingTab.classList.add("active-tab");

            initModalEvents();
            initOrderPopupEvents();
            document.getElementById("orderPopup").style.display = "flex";
          });
      } else {
        alert("❌ 상태 변경 실패");
      }
    })
    .catch(err => {
      console.error("❌ 상태 변경 에러", err);
      alert("서버 통신 오류");
    });
}

// orderpopup.html안에서 동작하는 버튼들 (판매취소, 판매하기, 상태변경(주문현황, 준비중))
function initOrderPopupEvents() {
  // 예: 판매취소 버튼
  document.querySelectorAll(".sell-cancel").forEach(btn => {
    btn.addEventListener("click", () => {
      const orderNo = btn.getAttribute("data-order-no");
      console.log("❌ 판매취소 클릭:", orderNo);
      showCancelModal(orderNo); // 네가 구현한 모달 띄우기 함수
    });
  });

  // 예: '판매하기' 버튼
  document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      console.log("🛒 판매하기 클릭");
      // 여기에 판매 처리 로직 있으면 연결
    });
  });

  // 상태 변경 배지 클릭
  document.querySelectorAll(".badge.preparing, .badge.complete").forEach(badge => {
    badge.addEventListener("click", () => {
      const orderNo = badge.closest(".order-card").querySelector(".sell-cancel").getAttribute("data-order-no");
      const newStatus = badge.classList.contains("preparing") ? 1 : 2;
      updateStatus(orderNo, newStatus, badge);
    });
  });
}





let confirmAction = null; // 모달에서 실행할 콜백

// 모달 메시지 설정 후 모달 열기(판매취소 모달 -> 확인 모달)
function openConfirmModal(message, onConfirm) {
  const modalMsg = document.getElementById("modalMessage");
  const modal = document.getElementById("customConfirmModal");
  

  if (!modal || !modalMsg) return;

  modalMsg.textContent = message;
  confirmAction = onConfirm;
  modal.style.display = "flex";
}

// 확인 모달 닫는 함수
function closeModal() {
  const modal = document.getElementById("customConfirmModal");
  if (modal) modal.style.display = "none";
  confirmAction = null;
}

// 확인 모달 모달 버튼 및 폼 관련 이벤트 연결
function initModalEvents() {
  const confirmBtn = document.getElementById("modalConfirmBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (confirmAction) confirmAction();
      closeModal();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // 이벤트 위임 - 수량변경, 삭제 버튼
document.body.addEventListener("click", (e) => {
  const target = e.target;

  // 🔸 수량변경 버튼 클릭 시
  if (target.closest(".cartcontrolBtn")) {
    e.preventDefault();
    console.log("🟡 수량변경 버튼 눌림");

    const form = target.closest("form");
    const formData = new FormData(form);
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

    openConfirmModal("수량을 변경하시겠습니까?", async () => {
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: {
            [csrfHeader]: csrfToken
          },
          body: formData
        });

        if (res.ok) {
          console.log("✅ 수량 변경 성공");
          const orderNo = form.querySelector("input[name='orderNo']").value;
          closeCancelModal(orderNo);

          // 주문 목록 새로 불러오기
          fetch(lastUsedUrl)
            .then(res => res.text())
            .then(html => {
              document.querySelector("#orderPopupContainer").innerHTML = html;
              initModalEvents();
              initOrderPopupEvents();
              document.getElementById("orderPopup").style.display = "flex";
            });
        } else {
          alert("수량 변경 실패");
        }
      } catch (err) {
        console.error("❌ 오류 발생", err);
        alert("서버 오류가 발생했습니다.");
      }
    });
  }

  // 🔸 삭제 버튼 클릭 시
  if (target.closest(".deleteBtn")) {
    e.preventDefault();
    console.log("🔴 삭제 버튼 눌림");

    const form = target.closest("form");
    const formData = new FormData(form);
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

    openConfirmModal("삭제하시겠습니까?", async () => {
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: {
            [csrfHeader]: csrfToken
          },
          body: formData
        });

        if (res.ok) {
          console.log("✅ 삭제 성공");
          const orderNo = form.querySelector("input[name='orderNo']").value;
          closeCancelModal(orderNo);

          fetch(lastUsedUrl)
            .then(res => res.text())
            .then(html => {
              document.querySelector("#orderPopupContainer").innerHTML = html;
              initModalEvents();
              initOrderPopupEvents();
              document.getElementById("orderPopup").style.display = "flex";
            });
        } else {
          alert("삭제 실패");
        }
      } catch (err) {
        console.error("❌ 오류 발생", err);
        alert("서버 오류가 발생했습니다.");
      }
    });
  }
});


  // submit 위임 - 전체 주문 취소
  document.body.addEventListener("submit", function (e) {
    if (e.target && e.target.classList.contains("order-delete-form")) {
      e.preventDefault();
      console.log("⚫ 전체취소 form 제출됨");
      const form = e.target;
      openConfirmModal("전체 주문을 취소하시겠습니까?", async () => {
      const formData = new FormData(form);

      const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
      const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: {
            [csrfHeader]: csrfToken
          },
          body: formData
        });

        if (res.ok) {
          console.log("✅ 전체 주문 취소 성공");
          const orderNo = form.querySelector("input[name='orderNo']").value;
          closeCancelModal(orderNo);

          // 주문 목록 다시 불러오기
          fetch("/admin/orderpopup/fetch?status=0")
            .then(res => res.text())
            .then(html => {
              document.querySelector("#orderPopupContainer").innerHTML = html;
              initModalEvents();
              initOrderPopupEvents();
              document.getElementById("orderPopup").style.display = "flex";
            });
        } else {
          console.error("❌ 주문 취소 실패");
          alert("취소에 실패했습니다.");
        }
      } catch (err) {
        console.error("❌ 오류 발생", err);
        alert("서버 오류가 발생했습니다.");
      }
    });
    }
  });
}


// 전체 orderpopup 관리
let isPopupLoaded = false;

async function loadOrderPopup() {
  const container = document.getElementById("orderPopupContainer");

  try {
    const res = await fetch("/admin/orderpopup/fetch", { cache: "no-store" });
    const html = await res.text();
    container.innerHTML = html;

    initModalEvents(); // ✅ 매번 이벤트 다시 연결!
    initOrderPopupEvents(); 
    console.log("✅ 팝업 로딩 완료");
  } catch (err) {
    console.error("❌ fetch 실패", err);
  }

  const popup = document.getElementById("orderPopup");
  if (popup) {
    const isVisible = popup.style.display === "flex";
    popup.style.display = isVisible ? "none" : "flex";
  }
  console.log("📍 popup:", popup);
  console.log("📍 container innerHTML:", container.innerHTML);
}
// sideright에서 모달 닫기 함수
function closeOrderPopup() {
  const popup = document.getElementById("orderPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

// 모달 외부 클릭 시 닫기
window.addEventListener("click", function (event) {
  const popup = document.getElementById("orderPopup");
  const box = document.querySelector(".order-popup-box");

  if (!popup || !box) return;

  if (popup.style.display === "flex" && !box.contains(event.target)) {
    closeOrderPopup(); 
  }
});

//sideright에서 누르면 모달 나오게 하는 것(loadOrderpopup이랑 연결)
document.addEventListener("DOMContentLoaded", () => {
  const productBtn = document.getElementById("toggle-orderpopup");
  const toggleBtn = document.querySelector(".toggle-btn");

  function togglePopup() {
    const popup = document.getElementById("orderPopup");

    if (popup && popup.style.display === "flex") {
      closeOrderPopup();
    } else {
      loadOrderPopup();
    }
  }

  if (productBtn) {
    productBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🛒 상품 버튼 눌림");
      togglePopup();
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("⬅ 버튼 눌림");
      togglePopup();
    });
  }
});


// 탭 전환
document.addEventListener("click", (e) => {
  const target = e.target.closest(".number-tab1, .number-tab2"); // 버튼 영역 전체 누를 수 있게
  console.log("🎯 실제 target은?", target);
  if (!target) return;

  e.preventDefault(); // 기본 이동 막기

  const url = target.getAttribute("href");
  const container = document.getElementById("orderPopupContainer"); // 💡 여기 id 확인해줘!

  lastUsedUrl = target.getAttribute("href");

  fetch(url, { cache: "no-store" })
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html; // 내용 덮어쓰기
      initModalEvents(); // 모달 이벤트 다시 연결
      initOrderPopupEvents(); 
      document.getElementById("orderPopup").style.display = "flex"; // ✅ 모달 다시 보이게!
      console.log("📦 탭 전환 완료:", url);

      // ✅ active-tab 다시 세팅
      document.querySelectorAll(".number-tab1, .number-tab2").forEach(el => {
        el.classList.remove("active-tab");
      });
      const matchingTab = document.querySelector(`a[href='${url}']`);
      if (matchingTab) matchingTab.classList.add("active-tab");
    })
    .catch(err => {
      console.error("❌ 탭 내용 불러오기 실패", err);
    });
});



