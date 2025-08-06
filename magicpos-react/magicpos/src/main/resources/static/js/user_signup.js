document.addEventListener('DOMContentLoaded', () => {
  const errorList = document.getElementById('user-signup-account-errors');
  const idInput = document.getElementById('user-signup-id');
  const emailInput = document.getElementById('user-signup-email');
  const birthInput = document.getElementById('user-signup-birth');
  const phoneInput = document.getElementById('user-signup-phone');

  const showError = (input, message, errorTarget) => {
    input.classList.add('error-border');
    input.focus();
    const li = document.createElement('li');
    li.textContent = message;
    errorTarget.appendChild(li);
  };

  const clearError = (input, errorTarget) => {
    input.classList.remove('error-border');
    errorTarget.innerHTML = '';
  };

  // 아이디 중복 검사
  idInput.addEventListener('blur', async () => {
    const value = idInput.value.trim();
    errorList.innerHTML = '';

    if (!value) {
      showError(idInput, "아이디를 입력해주세요.", errorList);
      return;
    }

    try {
      const res = await fetch(`/users/admin/check-id?id=${value}`);
      const result = await res.json();

        if (result.exists) {
            showError(idInput, "사용할 수 없는 아이디입니다.", errorList);
        } else {
            clearError(idInput, errorList);
        }
    } catch (e) {
      showError(idInput, "서버 오류로 아이디를 확인할 수 없습니다.", errorList);
    }
  });

  // 이메일 유효성 검사
  emailInput.addEventListener('blur', () => {
    const value = emailInput.value.trim();
    const errorList = document.getElementById('user-signup-personal-errors');
    errorList.innerHTML = '';

    if (!value.includes('@')) {
      showError(emailInput, "올바른 이메일 형식을 입력해주세요.", errorList);
    } else {
      clearError(emailInput, errorList);
    }
  });

// 생년월일 검사
birthInput.addEventListener('blur', () => {
  const value = birthInput.value.trim();
  const errorList = document.getElementById('user-signup-personal-errors');
  errorList.innerHTML = '';

  // 🔹 1단계: 형식 검사
  if (!/^\d{8}$/.test(value)) {
    showError(birthInput, "생년월일은 8자리 숫자(YYYYMMDD)여야 합니다.", errorList);
    return;
  }

  // 🔹 2단계: 유효한 날짜인지 검사
  const yyyy = parseInt(value.substring(0, 4), 10);
  const mm = parseInt(value.substring(4, 6), 10) - 1; // JS는 0-based month
  const dd = parseInt(value.substring(6, 8), 10);

  const date = new Date(yyyy, mm, dd);

  if (
    date.getFullYear() !== yyyy ||
    date.getMonth() !== mm ||
    date.getDate() !== dd
  ) {
    showError(birthInput, "존재하지 않는 날짜입니다.", errorList);
  } else {
    clearError(birthInput, errorList);
  }
});

    // 휴대폰 번호 검사
    phoneInput.addEventListener('blur', () => {
    let value = phoneInput.value.replace(/[^0-9]/g, ''); // 숫자만 남기기
    const errorList = document.getElementById('user-signup-personal-errors');
    errorList.innerHTML = '';

    if (!/^010\d{8}$/.test(value)) {
        showError(phoneInput, "휴대폰 번호는 010으로 시작하는 11자리 숫자여야 합니다.", errorList);
    } else {
        // 형식: 010-XXXX-XXXX
        const formatted = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        phoneInput.value = formatted;
        clearError(phoneInput, errorList);
    }
    });

    // 성별 
    const genderButtons = document.querySelectorAll('.user-signup-gender-btn');
    const genderInput = document.getElementById('user-signup-gender'); // 숨은 input

    genderButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 모든 버튼에서 active 클래스 제거
        genderButtons.forEach(btn => btn.classList.remove('selected'));

        // 클릭한 버튼만 active 스타일 적용
        button.classList.add('selected');

        // 숨은 input에 값 저장
        genderInput.value = button.dataset.gender;
    });
    });

    const form = document.getElementById("signup-form"); // form 정의
    // 폼 제출 전 생일 형식 변환(서버에 맞게)
form.addEventListener("submit", (e) => {
    e.preventDefault();         // 기본 제출 막기 
  const birthInput = document.getElementById("user-signup-birth");
  const raw = birthInput.value.trim();
  if (/^\d{8}$/.test(raw)) {
    birthInput.value = raw.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
  }

      // ✅ 콘솔에 변환 결과 출력
    console.log("변환된 생년월일:", birthInput.value);

  // 변환 끝난 뒤에 직접 제출 
  form.submit();
});
    

});

