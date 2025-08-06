document.addEventListener("DOMContentLoaded", function () {
  const showUsersBtn = document.getElementById("showUsersBtn");
  const userModal = document.getElementById("userModal");
  const closeUserModal = document.getElementById("closeUserModal");
  const userListContainer = document.getElementById("userListContainer");
  const searchBtn = document.getElementById("userSearchBtn");
  const searchInput = document.getElementById("userSearchInput");

  // 모달 열기
  showUsersBtn.addEventListener("click", function () {
    fetchUserList(""); // 전체 사용자 불러오기
    userModal.style.display = "block";
  });

  // 모달 닫기
  closeUserModal.addEventListener("click", function () {
    userModal.style.display = "none";
  });

  // 검색 버튼
  searchBtn.addEventListener("click", function () {
    const keyword = searchInput.value;
    fetchUserList(keyword);
  });

  // Enter 키로도 검색
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  // 사용자 목록 요청 함수
  function fetchUserList(keyword) {
    fetch(`/admin/users/modal?keyword=${encodeURIComponent(keyword)}`)
      .then(response => response.text())
      .then(html => {
        userListContainer.innerHTML = html;
      });
  }

  // 모달 외부 클릭 시 닫기
  window.addEventListener("click", function (event) {
    if (event.target === userModal) {
      userModal.style.display = "none";
    }
  });
});
