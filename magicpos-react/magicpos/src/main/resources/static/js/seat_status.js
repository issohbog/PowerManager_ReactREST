
// HTML <meta>에서 CSRF 토큰 정보 읽기
const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".clear-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const seatId = e.currentTarget.getAttribute("data-seat-id");
      if (!seatId) return;

      try {
        const res = await fetch(`/admin/seats/clear/${seatId}`, {
          method: "POST",
          headers: {
            [csrfHeader]: csrfToken
          }
        });

        const text = await res.text();

        if (text === "success") {
          location.reload(); // 또는 UI만 업데이트
        } else if (text === "fail") {
          alert("좌석 상태 변경에 실패했습니다.");
        } else {
          alert("서버 오류 발생");
        }
      } catch (err) {
        console.error("요청 중 오류:", err);
        alert("요청 처리 중 오류가 발생했습니다.");
      }
    });
  });

});

// ⏱ 시간 포맷 함수: 초 → "hh:mm:ss"
function formatRemainTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// ✅ 남은 시간 표시 + 매초 갱신
document.addEventListener("DOMContentLoaded", () => {
  const timeElements = document.querySelectorAll(".time-left");

  timeElements.forEach(el => {
    let remaining = parseInt(el.dataset.remaining, 10) * 60; // 분 → 초로 환산

    function updateTime() {
      if (remaining <= 0) {
        el.textContent = "만료됨";
        return;
      }

      el.textContent = `${formatRemainTime(remaining)} 남음`;
      remaining--;
    }

    updateTime(); // 최초 실행
    setInterval(updateTime, 1000); // 매초 갱신
  });
});