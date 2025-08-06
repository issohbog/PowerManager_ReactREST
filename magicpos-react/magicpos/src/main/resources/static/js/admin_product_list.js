// HTML <meta>에서 CSRF 토큰 정보 읽기
const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

document.addEventListener("DOMContentLoaded", () => {
  initCategoryModal();
  initProductModal();
  initUpdateModal();

  document.addEventListener("click", function(e) {
    if (e.target.classList.contains("category-close-btn")) {
      const modal = document.getElementById("category-modal");
      console.log("카테고리 X 클릭!", modal);
      closeProModal(modal);
    }
    if (e.target.classList.contains("product-close-btn")) {
      const productModal = document.getElementById("product-modal");
      const editModal = document.getElementById("edit-product-modal");
      if (productModal && productModal.style.display !== "none") {
        console.log("상품등록 X 클릭!", productModal);
        resetProductForm();
        closeProModal(productModal);
      }
      if (editModal && editModal.style.display !== "none") {
        console.log("상품수정 X 클릭!", editModal);
        closeProModal(editModal);
      }
    }
  });


  const imageBtn = document.querySelector('.image-btn');
  const imageInput = document.getElementById('product-image-input');
  const placeholder = document.querySelector('.image-placeholder');

  imageBtn.addEventListener('click', () => {
    imageInput.click(); // 파일 선택창 띄우기
  });

  // ------------------------- 상품 등록 요청 시작 ---------------------
  imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      // 이미지를 미리보기로 표시
      placeholder.innerHTML = `<img src="${e.target.result}" alt="미리보기" style="max-width: 100%; height: auto;">`;
    };
    reader.readAsDataURL(file);
  });

  document.querySelector(".btn-save").addEventListener("click", () => {
  const formData = new FormData();

  const category = document.getElementById("product-category").value;
  const name = document.getElementById("product-name").value;
  const price = document.getElementById("product-price").value;
  const description = document.getElementById("product-desc").value;
  if (!category || !name || !price) {
  alert("상품분류, 상품명, 상품가격은 필수 항목입니다.");
  return;ㅋ
  }

  formData.append("cNo", category);
  formData.append("pName", name);
  formData.append("description", description);
  formData.append("pPrice", price);

  // 노출설정
  formData.append("sellStatus", document.getElementById("pc-sale").checked);

  // 이미지
  const fileInput = document.getElementById("product-image-input");
  const file = fileInput.files[0];
  if (file) {
    formData.append("imageFile", file);
  }

  fetch("/products/admin/create", {
    method: "POST",
    body: formData,
    headers: {
      [csrfHeader]: csrfToken
    }
  })
    .then(res => res.ok ? res.text() : Promise.reject("상품 등록 실패"))
    .then(result => {
      alert("상품 등록 완료!");
      location.reload(); // 또는 모달 닫고 목록 갱신
    })
    .catch(err => alert(err));
  });
  // --------------------- 상품 등록 요청 완료 -----------------------

  // 상품 리스트 화면에서 재고 수량 변경 
  document.querySelectorAll(".stock-cell").forEach(cell => {
    const span = cell.querySelector(".stock-display");
    const input = cell.querySelector(".stock-input");

    span.addEventListener("click", () => {
      span.style.display = "none";
      input.style.display = "inline-block";
      input.focus();
    });

    input.addEventListener("blur", () => {
      // UI 되돌리기
      span.textContent = input.value;
      input.style.display = "none";
      span.style.display = "inline-block";
    });

    // ✅ change 이벤트 유지 (벡으로 값 전송)
    input.addEventListener("change", () => {
      const productNo = input.dataset.productNo;
      const newStock = input.value;

      console.log(`상품번호: ${productNo}, 변경된 재고: ${newStock}`);

      fetch('/products/admin/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ no: productNo, stock: newStock })
      })
      .then(res => res.ok ? res.text() : Promise.reject("실패"))
      .then(msg => console.log(msg))
      .catch(err => console.error(err));
    });
  });



  // 상품 목록에서 여러건 상품 체크 후 '상품 삭제' 버튼 클릭시 다건 삭제 실행 
  document.querySelector('.product-delete-btn')
  .addEventListener('click', deleteSelectedProducts);

});





function initCategoryModal() {
  const modal = document.getElementById("category-modal");
  if (!modal) return;

  document.querySelector(".category-add-btn")?.addEventListener("click", () => {
    modal.classList.remove("fade-out");
    modal.classList.add("fade-in");
    modal.style.display = "flex";
  });

  document.querySelectorAll(".category-close-btn")?.forEach(btn => {
    btn.addEventListener("click", () => closeProModal(modal));
  });
  document.querySelector(".category-button-group .cancel-btn")?.addEventListener("click", () => closeProModal(modal));
  modal.addEventListener("click", e => {
    if (e.target === modal) closeProModal(modal);
  });
}

function initProductModal() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  document.querySelector(".product-add-btn")?.addEventListener("click", () => {
    modal.classList.remove("fade-out");
    modal.classList.add("fade-in");
    modal.style.display = "flex";
  });

  document.querySelector(".product-close-btn")?.addEventListener("click", () => {
    resetProductForm();
    closeProModal(modal);
  });

  document.querySelector(".product-button-group .cancel-btn")?.addEventListener("click", () => {
    resetProductForm();
    closeProModal(modal);
  });

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      resetProductForm();
      closeProModal(modal);
    }
  });
}

// 상품 수정 
function initUpdateModal() {
  const modal = document.getElementById("edit-product-modal");
  if (!modal) return;

  const editImageBtn = modal.querySelector(".image-btn");
  const editImageInput = document.getElementById("edit-product-image-input");
  const editPlaceholder = modal.querySelector(".image-placeholder");

  editImageBtn.addEventListener("click", () => {
    editImageInput.click();
  });

  editImageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      editPlaceholder.innerHTML = `<img src="${e.target.result}" alt="미리보기" style="max-width: 100%; height: auto;">`;
    };
    reader.readAsDataURL(file);
  });

  // ✅ 상품 수정 버튼 클릭 시 모달 열기
  document.querySelector(".product-update-btn")?.addEventListener("click", () => {
    const checked = document.querySelector("tbody input[type='checkbox']:checked");
    if (!checked) {
      alert("수정할 상품을 선택하세요.");
      return;
    }

    const allChecked = document.querySelectorAll("tbody input[type='checkbox']:checked");
    if (allChecked.length > 1) {
      alert("하나의 상품만 선택해주세요.");
      return;
    }

    const row = checked.closest("tr");

    // ✅ 데이터 속성 가져오기 (HTML에서 tr에 data-* 추가되어 있어야 함)
    const productNo = row.dataset.productNo;
    const categoryNo = row.dataset.categoryNo;
    const pname = row.dataset.pname;
    const desc = row.dataset.description;
    const price = row.dataset.price;
    const sellStatus = row.dataset.sellStatus === "true";
    

    const imgPath = row.dataset.imgPath;
    const placeholder = modal.querySelector(".image-placeholder");

    // ✅ 이미지가 있으면 표시, 없으면 기본 이미지
    if (imgPath) {
      placeholder.innerHTML = `<img src="${imgPath}" alt="이미지 미리보기" style="max-width: 100%; height: auto;">`;
    } else {
      placeholder.innerHTML = `<img src="/images/no-image.png" alt="이미지 없음" style="max-width: 100%; height: auto;">`;
    }

    // ✅ 모달 열기
    modal.style.display = "flex";
    modal.classList.remove("fade-out");
    modal.classList.add("fade-in");

    // ✅ 수정 폼 값 채우기
    document.getElementById("edit-product-category").value = categoryNo;

    document.getElementById("edit-product-name").value = pname;
    document.getElementById("edit-product-desc").value = desc;
    document.getElementById("edit-product-price").value = price;
    document.getElementById("edit-pc-sale").checked = sellStatus;
  

    // ✅ 제품 번호를 data 속성으로 저장
    modal.setAttribute("data-product-no", productNo);

    // 모달 내 '삭제' 버튼 클릭 시 단건 삭제 실행
    modal.querySelector(".btn-delete")?.addEventListener("click", () => {
      const productNo = modal.getAttribute("data-product-no");
      deleteProduct(productNo);
    });

  });

  // ✅ 닫기 버튼 클릭 시
  modal.querySelector(".product-close-btn")?.addEventListener("click", () => {
    closeProModal(modal);
  });

  // ✅ 모달 외부 클릭 시 닫기
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeProModal(modal);
    }
  });

  // ✅ 수정 버튼 클릭 시 서버로 전송
  modal.querySelector(".btn-update")?.addEventListener("click", () => {
    const productNo = modal.getAttribute("data-product-no");
    const row = document.querySelector(`tr[data-product-no='${productNo}']`);
    const stock = row?.dataset.stock ?? 0;
    const formData = new FormData();
    formData.append("no", productNo);
    formData.append("cNo", document.getElementById("edit-product-category").value);
    formData.append("pName", document.getElementById("edit-product-name").value);
    formData.append("description", document.getElementById("edit-product-desc").value);
    formData.append("pPrice", document.getElementById("edit-product-price").value);
    formData.append("sellStatus", document.getElementById("edit-pc-sale").checked);
    formData.append("stock", stock);

    const file = document.getElementById("edit-product-image-input").files[0];
    if (file) {
      formData.append("imageFile", file);
    }

    fetch("/products/admin/update", {
      method: "POST",
      body: formData,
      headers: {
        [csrfHeader]: csrfToken
      }
    })
      .then(res => res.ok ? res.text() : Promise.reject("상품 수정 실패"))
      .then(msg => {
        alert("상품 수정 완료!");
        location.reload(); // 또는 테이블만 갱신
      })
      .catch(err => alert(err));
  });
}

// 상품 삭제 (단건) 
function deleteProduct(productNo) {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  fetch(`/products/admin/${productNo}/delete`, {
    method: "POST", // or DELETE if RESTful
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

// 상품 삭제 (다건)
function deleteSelectedProducts() {
  const checked = document.querySelectorAll("tbody input[type='checkbox']:checked");
  if (checked.length === 0) {
    alert("삭제할 상품을 선택하세요.");
    return;
  }

  if (!confirm("정말로 삭제하시겠습니까?")) return;

  const productNos = Array.from(checked).map(cb =>
    cb.closest("tr").getAttribute("data-product-no")
  );

  const formData = new URLSearchParams();
  productNos.forEach(no => formData.append("productNos", no));

  fetch("/products/admin/deleteAll", {
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





function closeProModal(modal) {
  console.log("closeProModal 실행됨!", modal);
  modal.classList.remove("fade-in");
  modal.classList.add("fade-out");
  setTimeout(() => {
    modal.style.display = "none";
    modal.classList.remove("fade-out");
  }, 300);
}


// 상품 등록 후 입력 창 초기화 
function resetProductForm() {
  document.getElementById("product-category").value = "";
  document.getElementById("product-name").value = "";
  document.getElementById("product-price").value = "";
  document.getElementById("product-desc").value = "";
  document.getElementById("pc-sale").checked = false;
  document.getElementById("product-image-input").value = "";

  const placeholder = document.querySelector('.image-placeholder');
  placeholder.innerHTML = "제품 이미지 등록"; // 또는 기본 placeholder 이미지/텍스트
}

// 카테고리 추가 함수 
function addCategory() {
  const input = document.getElementById("new-category-input");
  const categoryName = input.value.trim();
  if (!categoryName) {
    alert("분류명을 입력해주세요.");
    return;
  }

  // ✅ FormData 객체 생성
  const formData = new FormData();
  formData.append("cName", categoryName); // 서버 DTO 또는 VO의 필드명과 일치해야 함

  // ✅ fetch로 전송 (Content-Type은 자동 설정됨)
  fetch('/categories/admin/create', {
    method: 'POST',
    body: formData,
    headers: {
      [csrfHeader]: csrfToken
    }
  })
  .then(response => response.text())
  .then(result => {
    if (result !== "ok") {
      throw new Error("서버 응답 실패");
    }

    // 테이블에 행 추가
    const table = document.getElementById("category-table");
    const rowCount = table.rows.length;

    const newRow = document.createElement("tr");


    newRow.innerHTML = `
      <td>${rowCount + 1}</td>
      <td class="category-edit-wrapper">
        <span onclick="editCategory(this)" data-category-no="0">${categoryName}</span>
      </td>
      <td>
        <button type="button" class="delete-category-btn"
                onclick="deleteCategoryRow(this)">×</button>
      </td>
    `;
    table.appendChild(newRow);
    input.value = "";

    location.reload()
  })
  .catch(error => {
    console.error("카테고리 등록 실패:", error);
    alert("등록에 실패했습니다.");
  });
}

function editCategory(span) {
  const categoryNo = span.getAttribute("data-category-no");
  const name = span.textContent.trim();

  const wrapper = span.parentElement; // .category-edit-wrapper

  const input = document.createElement("input");
  input.type = "text";
  input.value = name;

  const button = document.createElement("button");
  button.textContent = "수정";
  button.onclick = function () {
    updateCategoryName(categoryNo, input.value, wrapper);
  };

  // 기존 내용 제거하고 input + 버튼 삽입
  wrapper.innerHTML = "";
  wrapper.appendChild(input);
  wrapper.appendChild(button);
}


function updateCategoryName(no, newName, wrapper) {
  if (!newName.trim()) {
    alert("분류명을 입력해주세요.");
    return;
  }

  const formData = new FormData();
  formData.append("no", no);
  formData.append("cName", newName);

  fetch("/categories/admin/update", {
    method: "POST",
    body: formData,
    headers: {
      [csrfHeader]: csrfToken
    }
  })
    .then(res => res.text())
    .then(result => {
      if (result === "ok") {
        const newSpan = document.createElement("span");
        newSpan.className = "category-name-text";
        newSpan.setAttribute("data-category-no", no);
        newSpan.textContent = newName;
        newSpan.onclick = function () {
          editCategory(newSpan);
        };

        wrapper.innerHTML = ""; // input, 버튼 제거
        wrapper.appendChild(newSpan); // 다시 span으로
      } else {
        alert("수정 실패!");
      }
    })
    .catch(err => {
      console.error("수정 오류:", err);
      alert("수정 중 오류가 발생했습니다.");
    });
}

// 카테고리 삭제 
function deleteCategoryRow(button) {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  const row = button.closest("tr");
  const categoryNo = button.getAttribute("data-category-no");

  const formData = new FormData();
  formData.append("no", categoryNo);

  fetch("/categories/admin/delete", {
    method: "POST",
    body: formData,
    headers: {
      [csrfHeader]: csrfToken
    }
  })
    .then(res => res.text())
    .then(result => {
      if (result === "ok") {
        row.remove(); // 삭제 성공 시 테이블에서 행 제거
        alert("삭제되었습니다.");
      } else {
        throw new Error("삭제 실패");
      }
    })
    .catch(err => {
      console.error("삭제 오류:", err);
      alert("삭제에 실패했습니다.");
    });
}

