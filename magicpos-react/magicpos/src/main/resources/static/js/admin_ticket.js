function openAdminTicketModal() {
  const modal = document.getElementById("admin-ticket-modal");
  if (modal) {
    modal.style.display = "flex";
    loadTicketsToModal();       // 티켓 목록 불러오는 ajax 호출
    
    // 모달 내부 요소들 확인
    const payButtons = document.querySelectorAll(".admin-pay-btn");
    const confirmBtn = document.querySelector(".admin-confirm-btn");
    const hiddenInput = document.getElementById("selected-payment-method");
    
    console.log("🔍 결제 버튼 개수:", payButtons.length);
    console.log("🔍 결제하기 버튼:", confirmBtn);
    console.log("🔍 hidden input:", hiddenInput);
  } else {
    console.error("🔍 admin-ticket-modal을 찾을 수 없습니다!");
  }
}

function closeAdminTicketModal() {
  const modal = document.getElementById("admin-ticket-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("admin_ticket.js 로드됨");
  
  const openBtn = document.getElementById("openAdminTicketModalBtn");
  console.log("openAdminTicketModalBtn 찾음:", openBtn);
  
  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      console.log("버튼 클릭됨!");
      e.preventDefault();
      openAdminTicketModal();
    });
  } else {
    console.error("openAdminTicketModalBtn 버튼을 찾을 수 없습니다!");
  }

  // 실시간 유저 검색 
  const input = document.getElementById('admin-user-search-input');
  const resultBox = document.getElementById('admin-user-search-result');
  const hiddenUserNoInput = document.getElementById('selected-user-no');

  let debounceTimer;                            // 타이핑이 멈췄을 때만 요청을 보내기 위한 타이머 변수 

  if (input) {                                  // 검색창에 글자가 입력되면 실행되는 코드 작성 (input 요소가 있을때만 작동!)
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);              // 타이머를 초기화 해서 계속 입력중이면 검색하지 않도록 함 
      const keyword = input.value.trim();       // 입력한 글자에서 앞 뒤 공백 제거해서 검색어로 저장

      if (keyword.length < 1) {                 // 아무 글자도 없으면 
        resultBox.innerHTML = '';               // 검색 결과를 비우고 
        return;                                 // 그만 실행함                                             
      }

      debounceTimer = setTimeout(() => {
        fetch(`/usertickets/admin/usersearch?keyword=${encodeURIComponent(keyword)}`)
          .then(response => response.json())                // json으로 받은 데이터 js에서 사용할 수 있도록 변환
          .then(data => {                                   // 이전 검색 결과 지우기 
            resultBox.innerHTML = '';                       // 결과 초기화
            resultBox.style.display = 'block';              // 검색 결과 창 다시 보여주기

            if (data.length === 0) {                        // 결과가 아무것도 없으면 안내 메세지 
              resultBox.innerHTML = '<li>일치하는 회원이 없습니다</li>';
              return;
            }

            data.forEach(user => {                          // 사용자 수만큼 li를 만들어 한명씩 보여줌
              const li = document.createElement('li');
              li.textContent = `${user.username} (${user.userId})`;     // 홍길동(hong1234) 이런식으로 작성
              li.dataset.userNo = user.userNo;                          // 선택했을때 쓸 수 있도록 userNo 도 숨겨서 저장
              resultBox.appendChild(li);                                // 만든 li를 검색 결과 박스 안에 추가 
            });
          });
      }, 300);                          // 0.3초동안 입력이 없으면 위 요청 실행
    });

    resultBox.addEventListener('click', (e) => {                    // 검색 결과 중 li를 클릭했을 때만 동작하는 이벤트 
      const li = e.target.closest('li');
      if (!li) return;
      
      input.value = li.textContent;                                 // 검색창에 클릭한 회원 이름 표시
      hiddenUserNoInput.value = li.dataset.userNo;                  // 숨은 input에 userNo 저장
      resultBox.innerHTML = '';                                     // 검색 결과 창 닫음
      resultBox.style.display = 'none';                             // ul도 화면에서 숨기기
      

    });

    // 포커스 아웃 시 검색 결과 닫기
    document.addEventListener('click', (e) => {                     // 바깥 아무곳이나 클릭하면 자동으로 결과 창 닫음
      if (!e.target.closest('.admin-search-bar')) {
        resultBox.innerHTML = '';
      }
    });
  }
});

// Ajax로 티켓 목록 불러와서 테이블에 바인딩
function loadTicketsToModal() {
  fetch("/usertickets/admin/tickets")
    .then(res => res.json())
    .then(ticketList => {
      const tbody = document.querySelector(".admin-ticket-table tbody");
      tbody.innerHTML = "";

      ticketList.forEach(ticket => {
        const row = `
          <tr>
            <td>${ticket.ticketName}</td>
            <td>${formatTime(ticket.time)}</td>
            <td>${ticket.price.toLocaleString()}원</td>
            <td><button class="admin-add-btn" data-tno="${ticket.no}" data-name="${ticket.ticketName}" data-time="${ticket.time}" data-price="${ticket.price}">＋</button></td>
          </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
      });
    })
    .catch(err => {
      console.error("티켓 목록 불러오기 실패:", err);
    });
}

// 시간 포맷: 분 → "시:분" 형식 (예: 40 → 00:40)
function formatTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// document 전체에 이벤트 위임
document.addEventListener("click", (e) => {
  // + 버튼 클릭 시
  if (e.target.classList.contains("admin-add-btn")) {
    const btn = e.target;

    // data-* 속성에서 값 추출
    const name = btn.dataset.name;
    const time = formatTime(btn.dataset.time);
    const price = parseInt(btn.dataset.price).toLocaleString() + "원";

    // 우측 영역에 값 세팅
    document.querySelector(".admin-ticket-name").textContent = name;
    document.querySelector(".admin-ticket-info").textContent = `${price} (${time})`;

    // 선택된 티켓의 번호도 저장 (결제 API용)
    document.querySelector(".admin-confirm-btn").dataset.tno = btn.dataset.tno;
  }
  
  // 결제 방법 선택 버튼 클릭 시
  if (e.target.classList.contains("admin-pay-btn")) {
    console.log("💳 결제 버튼 클릭됨!");
    const btn = e.target;
    const paymentMethod = btn.dataset.payment;
    console.log("💳 결제 방법:", paymentMethod);
    
    // 모든 결제 버튼에서 selected 클래스 제거
    document.querySelectorAll(".admin-pay-btn").forEach(btn => {
      btn.classList.remove("selected");
    });
    
    // 클릭된 버튼에 selected 클래스 추가
    btn.classList.add("selected");
    console.log("💳 selected 클래스 추가됨");
    
    // 선택된 결제 방법을 hidden input에 저장
    const hiddenInput = document.getElementById("selected-payment-method");
    if (hiddenInput) {
      hiddenInput.value = paymentMethod;
      console.log("💳 hidden input에 저장됨:", paymentMethod);
    } else {
      console.error("💳 selected-payment-method input을 찾을 수 없습니다!");
    }
    
    console.log("선택된 결제 방법:", paymentMethod);
  }
});

// 관리자 요금제 결제 처리 함수
function processAdminTicketPayment() {
  console.log("💳 결제하기 버튼 클릭됨!");
  
  const selectedUserNo = document.getElementById("selected-user-no").value;
  const selectedTicketNo = document.querySelector(".admin-confirm-btn").dataset.tno;
  const selectedPaymentMethod = document.getElementById("selected-payment-method").value;
  const ticketName = document.querySelector(".admin-ticket-name").textContent;
  const ticketInfo = document.querySelector(".admin-ticket-info").textContent;
  
  console.log("💳 선택된 값들:", {
    selectedUserNo,
    selectedTicketNo,
    selectedPaymentMethod,
    ticketName,
    ticketInfo
  });

  // 유효성 검사
  if (!selectedUserNo) {
    alert("회원을 선택해주세요.");
    return;
  }

  if (!selectedTicketNo) {
    alert("요금제를 선택해주세요.");
    return;
  }

  if (!selectedPaymentMethod) {
    alert("결제 방법을 선택해주세요.");
    return;
  }

  console.log("선택된 결제 방법:", selectedPaymentMethod);

    // 신용카드 선택 시 토스페이먼츠로 이동
  if (selectedPaymentMethod === "CARD") {
    // 백엔드에서 티켓 정보 조회
    console.log("💳 티켓 정보 조회 요청:", `/usertickets/ticket/${selectedTicketNo}`);
    fetch(`/usertickets/ticket/${selectedTicketNo}`)
      .then(response => {
        console.log("💳 응답 상태:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(ticketInfo => {
        if (ticketInfo.error) {
          console.error("💳 티켓 정보 조회 실패:", ticketInfo.error);
          alert("티켓 정보를 가져올 수 없습니다: " + ticketInfo.error);
          return;
        }
        
        // 백엔드에서 가져온 실제 티켓 가격 사용
        const amount = ticketInfo.price;
        const orderId = `admin_ticket_${Date.now()}_user${selectedUserNo}_ticket${selectedTicketNo}`;
        const orderName = ticketInfo.ticketName;
        const serverIp = ticketInfo.serverIp;       // 서버ip

        console.log("💳 백엔드에서 가져온 티켓 정보:", ticketInfo);
        console.log("💳 토스페이먼츠 결제 요청:", {
          orderId,
          amount,
          orderName,
          userNo: selectedUserNo,
          ticketNo: selectedTicketNo,
          serverIp: serverIp
        });
        
        // 토스페이먼츠 결제창 직접 호출
        tossPayments.requestPayment("카드", {
          amount: amount,
          orderId: orderId,
          orderName: orderName,
          customerName: "관리자",
          successUrl: `http://${serverIp}:8080/admin/payment/ticket/success`,
          failUrl: `http://${serverIp}:8080/admin/payment/ticket/fail`
        });
      })
      .catch(error => {
        console.error("💳 티켓 정보 조회 중 오류:", error);
        alert("티켓 정보 조회 중 오류가 발생했습니다.");
      });
    return;
  }

  // 현금 결제 시
  if (selectedPaymentMethod === "CASH") {
    // CSRF 토큰 가져오기
    const csrfToken = document.querySelector('input[name="_csrf"]').value;

    // 결제 정보 구성
    const paymentData = {
      uNo: parseInt(selectedUserNo),
      tNo: parseInt(selectedTicketNo),
      payment: selectedPaymentMethod,
      payAt: new Date().toISOString()
    };

    // 서버로 결제 요청 전송 (관리자용 API)
    fetch("/usertickets/admin/insert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify(paymentData)
    })
    .then(response => response.text())
    .then(result => {
      if (result === "success") {
        alert("요금제 구매가 완료되었습니다.");
        closeAdminTicketModal();
        // 모달 초기화
        document.getElementById("selected-user-no").value = "";
        document.getElementById("admin-user-search-input").value = "";
        document.querySelector(".admin-ticket-name").textContent = "";
        document.querySelector(".admin-ticket-info").textContent = "";
        document.getElementById("selected-payment-method").value = "";
        // 선택된 결제 버튼 스타일 초기화
        document.querySelectorAll(".admin-pay-btn").forEach(btn => {
          btn.classList.remove("selected");
        });
      } else {
        alert("결제에 실패했습니다.");
      }
    })
    .catch(error => {
      console.error("결제 처리 중 오류 발생:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    });
  }
}