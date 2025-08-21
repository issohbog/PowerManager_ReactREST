// UsingUserModalContainer.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import UsingUserModal from '../../components/Admin/modal/UsingUserModal';
import { LoginContext } from '../../contexts/LoginContext'; // ✅ context import

const UsingUserModalContainer = ({ isVisible, onClose, onUserSelect }) => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const abortRef = useRef(null);

  const { isLogin } = useContext(LoginContext); // 필요시 roles도 꺼낼 수 있음
  const token = localStorage.getItem('jwt'); // 또는 context에서 userInfo.token

  // ✅ 안전한 fetch 함수
  const fetchUserList = async (searchKeyword = '') => {
    // 이전 요청 취소 (레이스 컨디션 방지)
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      // 캐시 무력화 쿼리 추가 + no-store
      const url = `/api/admin/users/search?keyword=${encodeURIComponent(searchKeyword)}&_=${Date.now()}`;
      const res = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('🔗 요청 URL:', url.toString());
      const raw = await res.text();                    // ⬅️ 먼저 text로
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} | body: ${raw}`);
      if (!raw) {                                      // ⬅️ 본문 비어있을 때 방어
        console.warn('⚠️ 응답 본문이 비어있음');
        setUserList([]);
        return;
      }

      const data = JSON.parse(raw);                    // ⬅️ 안전 파싱

      if (data?.success) {
        const list = Array.isArray(data.userList) ? data.userList : [];
        setUserList(list);
        // ⚠️ 결과 0건은 정상: alert 금지 (UI에서 "없음"만 표시)
        if (list.length === 0) console.log(data.message || '검색 결과가 없습니다.');
      } else {
        // 진짜 실패만 알림
        console.error('❌ 사용자 목록 조회 실패:', data?.message);
        setUserList([]);
        alert(data?.message || '사용자 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // 최신 요청만 살리기 위해 취소된 이전 요청: 무시
        return;
      }
      console.error('❌ 사용자 목록 요청 실패:', err);
      setUserList([]);
      // 여기서는 굳이 alert 안 띄움 (네트워크 잠깐 끊겨도 UX 유지)
      // 필요하면 토스트로만 안내하도록 변경
    } finally {
      setLoading(false);
    }
  };

  // ✅ 모달 열릴 때 전체 목록 로드
  useEffect(() => {
    if (isVisible) {
      setKeyword('');
      fetchUserList('');
    } else {
      // 모달 닫히면 진행 중 요청 취소
      if (abortRef.current) abortRef.current.abort();
    }
    // 언마운트 시에도 취소
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [isVisible]);

  // ✅ 검색 실행
  const handleSearch = () => {
    fetchUserList(keyword.trim());
  };

  // ✅ 엔터키로 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <UsingUserModal
      isVisible={isVisible}
      onClose={onClose}
      userList={userList}
      loading={loading}
      keyword={keyword}
      setKeyword={setKeyword}
      onSearch={handleSearch}
      onKeyPress={handleKeyPress}
      onUserSelect={onUserSelect}
    />
  );
};

export default UsingUserModalContainer;
