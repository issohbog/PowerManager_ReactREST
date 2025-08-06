// HTML <meta>에서 CSRF 토큰 정보 읽기
const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');


// ✅ 회원 정보 모달 확장 통합 버전 with 클래스 기반 버튼 렌더링

const modal = document.getElementById("user-modal");
const modalTitle = document.getElementById("modal-title");
const submitBtn = document.getElementById("modal-submit-btn");
const modeInput = document.getElementById("form-mode");
const userNoInput = document.getElementById("user-no");
const idWrapper = document.getElementById("id-input-wrapper");
const idCheckBtn = document.getElementById("id-check-btn");
const idInput = document.getElementById("user-id");
const idMessage = document.getElementById("id-check-message");
const form = document.getElementById("user-form");
const footer = document.getElementById("modal-footer");

function openUserModal(mode, user = {}, remain = 0, used = 0) {
  form.reset();

  modal.classList.remove("fade-out");
  modal.classList.add("fade-in");
  modal.style.display = "flex";


  idMessage.textContent = "";
  idMessage.classList.remove("success", "error");

  modeInput.value = mode;
  userNoInput.value = user.no || "";


  idInput.readOnly = false;
  idCheckBtn.style.display = "inline-block";
  submitBtn.style.display = "inline-block";
  submitBtn.disabled = false;

  if (mode === "register") {
    modalTitle.textContent = "회원등록";
    form.action = "/users/admin/save";
    renderFooterButtons("register");

    const inputs = modal.querySelectorAll("input, textarea");
    inputs.forEach(el => {
      el.removeAttribute("readOnly");
      el.removeAttribute("disabled");

    });

    document.getElementById("usedMin").disabled = true;
    document.getElementById("remainMin").disabled = true;



  } else if (mode === "edit") {
    modalTitle.textContent = "회원수정";
    form.action = "/users/update";

    fillForm(user, remain, used, false);
    idInput.readOnly = true;
    idCheckBtn.style.display = "none";
    renderFooterButtons("edit", user.no);

  } else if (mode === "view") {
    modalTitle.textContent = "회원정보";
    submitBtn.style.display = "none";
    idCheckBtn.style.display = "none";
    fillForm(user, remain, used, true);
    renderFooterButtons("view", user.no, user, remain, used);
  }

  modal.style.display = "flex";
}

function renderFooterButtons(mode, userNo = null, user = {}, remain = 0, used = 0) {
  if (mode === "register") {
    footer.innerHTML = `
      <button type="button" onclick="closeUserModal()" class="btn-cancel">취소</button>
      <button type="submit" id="modal-submit-btn" class="btn-save">저장</button>
    `;
  } else if (mode === "edit") {
    footer.innerHTML = `
      <button type="button" onclick="deleteUser(${userNo})" class="btn-delete">삭제</button>
      <button type="button" onclick="handleUserUpdate()" class="btn-edit">수정</button>
    `;
  } else if (mode === "view") {
    footer.innerHTML = `
      <button type="button" onclick="resetPassword(${userNo})" class="btn-reset">비밀번호 초기화</button>
      <button type="button" onclick='openUserModal("edit", ${JSON.stringify(user)}, ${remain}, ${used})' class="btn-edit">회원정보 수정</button>
    `;
  }
}

function fillForm(user, remain, used, readOnly = false) {
  document.getElementById("username").value = user.username || "";
  document.getElementById("user-id").value = user.id || "";
  document.getElementById("hidden-id").value = user.id || "";

  document.getElementById("birth").value = user.birth?.substring(0, 10) || "";
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("memo").value = user.memo || "";
  document.getElementById("remainMin").value = remain || 0;
  document.getElementById("usedMin").value = used || 0;

  const inputs = modal.querySelectorAll("input, textarea");
  inputs.forEach(el => {
    if (readOnly) {
      el.setAttribute("readOnly", true);
      el.setAttribute("disabled", true);
    } else {
      el.removeAttribute("readOnly");
      el.removeAttribute("disabled");
    }
  });

  document.getElementById("usedMin").disabled = true;
  document.getElementById("remainMin").disabled = true;
}

document.querySelectorAll(".user-tbody tr").forEach(row => {
  row.addEventListener("click", async () => {
    const userNo = row.getAttribute("data-user-no");
    try {
      const response = await fetch(`/users/admin/${userNo}/info`);
      const data = await response.json();
      openUserModal("view", data.user, data.remainTime, data.usedTime);
    } catch (e) {
      alert("회원 정보를 불러오지 못했습니다.");
    }
  });
});

document.querySelectorAll("tbody input[type='checkbox']").forEach(cb => {
  cb.addEventListener("click", e => e.stopPropagation());
});

document.querySelector('.button-group .action:nth-child(1)').addEventListener('click', () => {
  openUserModal("register");
});

document.querySelector('.button-group .action:nth-child(2)').addEventListener('click', async () => {
  const checkedList = document.querySelectorAll("tbody input[type='checkbox']:checked");
  if (checkedList.length === 0) {
  return alert("수정할 회원을 선택하세요.");
  }
  
  if (checkedList.length > 1) {
    return alert("수정할 회원을 한 명만 선택해주세요.");
  }
  const row = checkedList[0].closest("tr");
  const userNo = row.getAttribute("data-user-no");

  try {
    const response = await fetch(`/users/admin/${userNo}/info`);
    const data = await response.json();
    openUserModal("edit", data.user, data.remainTime, data.usedTime);
  } catch (e) {
    alert("회원 정보를 불러오지 못했습니다.");
  }
});

idCheckBtn.addEventListener("click", async () => {
  const userId = idInput.value.trim();
  idMessage.textContent = "";
  idMessage.classList.remove("success", "error");

  if (!userId) {
    idMessage.textContent = "아이디를 입력해주세요.";
    idMessage.classList.add("error");
    return;
  }

  try {
    const response = await fetch(`/users/admin/check-id?id=${encodeURIComponent(userId)}`,{
      headers: {
        [csrfHeader]: csrfToken
      }
    });
    const result = await response.json();
    if (result.exists) {
      idMessage.textContent = "이미 사용 중인 아이디입니다.";
      idMessage.classList.add("error");
    } else {
      idMessage.textContent = "사용 가능한 아이디입니다.";
      idMessage.classList.add("success");
    }
  } catch (e) {
    idMessage.textContent = "중복확인 중 오류 발생";
    idMessage.classList.add("error");
  }
});

function handleUserUpdate() {
  const userNo = document.getElementById("user-no").value;
  const username = document.getElementById("username").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const birth = document.getElementById("birth").value;
  const memo = document.getElementById("memo").value;
  const gender = document.querySelector("input[name='gender']:checked")?.value;
  
  const formData = new FormData();
  formData.append("no", userNo);
  formData.append("username", username);
  formData.append("phone", phone);
  formData.append("email", email);
  formData.append("birth", birth);
  formData.append("memo", memo);
  formData.append("gender", gender);

  fetch("/users/admin/update", {
    method: "POST",
    body: formData,
    headers: {
      [csrfHeader]: csrfToken
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("서버 오류");
      return res.text(); // redirect니까 text로 받음
    })
    .then(() => {
      alert("수정 완료!");
      location.href = "/users/admin/userlist"; // 새로고침
    })
    .catch(err => alert("수정 실패: " + err.message));
}


async function resetPassword(userNo) {
  if (!confirm("비밀번호를 초기화하시겠습니까?")) return;

  const response = await fetch(`/users/admin/${userNo}/reset`, 
    { method: "POST",
      headers: {
        [csrfHeader]: csrfToken
      }
    });
  const data = await response.json();

  if (data.success) {
    const tempModal = document.getElementById("temp-password-modal");
    const titleEl = tempModal.querySelector(".modal-title");
    const bodyEl = tempModal.querySelector(".modal-body");

    titleEl.textContent = "비밀번호 초기화 완료";
    bodyEl.innerHTML = `
      <p><strong>${data.username}</strong> 님의 비밀번호가 초기화되었습니다.</p>
      <p>임시 비밀번호: 
        <span style="color: red; font-weight: bold;">${data.tempPassword}</span>
      </p>
    `;
    tempModal.style.display = "flex";
  } else {
    alert(data.message || "비밀번호 초기화 실패");
  }
}


// 수정 화면에서 회원 삭제(단건)
function deleteUser(userNo) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  fetch(`/users/admin/${userNo}/delete`, {
    method: "POST",
    headers: {
      [csrfHeader]: csrfToken
    }
  }).then(res => {
    if (res.ok) {
      alert("삭제 완료");
      location.reload();
    } else {
      alert("삭제 실패");
    }
  });
}


// 체크된 회원 모두 삭제 
function deleteSelectedUsers() {
  const checked = document.querySelectorAll("tbody input[type='checkbox']:checked");
  if (checked.length === 0) {
    alert("삭제할 회원을 선택하세요.");
    return;
  }

  if (!confirm("정말로 삭제하시겠습니까?")) return;

  const userNos = Array.from(checked).map(cb => {
    const tr = cb.closest("tr");
    return tr.getAttribute("data-user-no");
  });

  const formData = new URLSearchParams();
  userNos.forEach(no => formData.append("userNos", no));

  fetch("/users/admin/deleteAll", {
    method: "POST",
    body: formData,
    headers: {
      [csrfHeader]: csrfToken,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("삭제 실패");
      return res.text();
    })
    .then(() => {
      alert("삭제 완료");
      location.reload();
    })
    .catch(err => alert("에러: " + err.message));
}


// 회원 삭제 버튼 클릭시 위에 정의한 회원다중삭제 실행
document.querySelector('.button-group .action:nth-child(3)')
  .addEventListener('click', deleteSelectedUsers);


function closeUserModal() {
  const modal = document.getElementById("user-modal")
  if( !modal ) return;


  modal.classList.remove("fade-in");
  modal.classList.add("fade-out");

  setTimeout(() => {
  modal.style.display = "none";
  modal.classList.remove("fade-out");
  }, 300); // fade-out 애니메이션 시간과 맞춰야 함
}

function closeTempPasswordModal() {
  const tempModal = document.getElementById("temp-password-modal");
  tempModal.style.display = "none";
}

form.addEventListener("submit", function(e) {
  // 이미 CSRF input이 있으면 중복 추가 방지
  if (!form.querySelector("input[name='_csrf']")) {
    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "_csrf";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);
  }
});











