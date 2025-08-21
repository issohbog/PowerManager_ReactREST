import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styles from '../css/Userlist.module.css';
import Pagination from './Pagination';
import { format } from 'date-fns';                  // 날짜 포맷팅을 위한 date-fns 라이브러리

// UserList를 forwardRef 로 변경 => 부모에서 props 처럼 제어 가능 
const UserList = forwardRef((props, ref) => {
  const { users, pagination, onSearch, onEdit, onRegister, onDelete, onPageChange, onView, clearSelectedUserNos } = props;
  const [type, setType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedUserNos, setSelectedUserNos] = useState([]); // 선택된 유저 번호 배열

  // 외부에서 선택해제 할 수 있도록 함수 노출 
  useImperativeHandle(ref, () => ({
    clearSelection: () => clearSelectedUserNos()
  }));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(type, keyword);
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (userNo, checked) => {
    setSelectedUserNos(prev =>
      checked ? [...prev, userNo] : prev.filter(no => no !== userNo)
    );
  };

  // 회원수정 버튼 클릭
  const handleEditClick = () => {
    if (selectedUserNos.length === 0) {
      alert('수정할 회원을 선택하세요.');
      return;
    }
    if (selectedUserNos.length > 1) {
      alert('수정할 회원을 한 명만 선택해주세요.');
      return;
    }
    // users에서 선택된 유저 객체 찾기
    const user = users.find(u => u.no === selectedUserNos[0]);
    if (user) onEdit(user);
  };

  // 회원삭제 버튼 클릭
  const handleDeleteClick = () => {
    if (selectedUserNos.length === 0) {
      alert('삭제할 회원을 선택하세요.');
      return;
    }
    if (!window.confirm('정말로 삭제하시겠습니까?')) {
      return;
    }
    // 여러 명 삭제도 지원하려면 배열 전체 전달
    onDelete(selectedUserNos);
    clearSelectedUserNos(); // 삭제 후 선택 해제
  };



  console.log('UserList users:', users); // ✅ 사용자 목록 확인용 로그
  console.log('UserList pagination:', pagination); // ✅ 페이지네이션 정보 확인용 로그
  return (
    <div className={styles.userList}>
        <div className={styles.topControls}>
            <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
                <select value={type} onChange={e => setType(e.target.value)} className={styles.adminCategory}>
                    <option value="">전체</option>
                    <option value="id">아이디</option>
                    <option value="username">이름</option>
                    <option value="phone">전화번호</option>
                </select>

                <div className={styles.searchBox}>
                    <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="이름/전화번호/아이디"
                    />
                    <button type="submit" className={styles.searchIcon}>
                        <img src="/images/search.png" alt="검색" />
                    </button>
                </div>
            </form>
        </div>

      <div className={styles.buttonGroup}>
        <button className={styles.btnRegister} onClick={onRegister}>회원등록</button>
        <button className={styles.btnEdit} onClick={handleEditClick}>회원수정</button>
        <button className={styles.btnDelete} onClick={handleDeleteClick}>회원삭제</button>
      </div>
      <table className={styles.userTable}>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>No.</th>
            <th>이름</th>
            <th>아이디</th>
            <th>생년월일</th>
            <th>전화번호</th>
            <th>이메일</th>
            <th>남은 시간</th>
            <th>사용 시간</th>
            <th>가입일자</th>
          </tr>
        </thead>
        <tbody>
          {(users || []).map((user, idx) => (
            <tr key={user.no}
                onClick={() => onView && onView(user)}
                style={{ cursor: 'pointer' }}
              >
              <td><input 
                    type="checkbox"
                    checked={selectedUserNos.includes(user.no)}   // 이 체크박스가 선택된 상태인지(selectedUserNos 배열에 user.no가 포함되어 있는지) 판단해서 체크 표시를 결정
                    onChange={e => handleCheckboxChange(user.no, e.target.checked)}   // 체크박스의 체크 상태가 바뀔 때마다 handleCheckboxChange 함수가 호출되어, 선택된 유저 번호 배열(selectedUserNos)을 업데이트
                    onClick={e => e.stopPropagation()}     // 체크박스 클릭 시 행 클릭 이벤트 방지
                  />
              </td>
              <td>{(pagination.page - 1) * pagination.size + idx + 1}</td>
              <td>{user.username}</td>
              <td>{user.id}</td>
              <td>{user.birth ? format(new Date(user.birth), 'yyyy-MM-dd') : ''}</td>
              <td>{user.phone}</td>
              <td>{user.email}</td>
              <td>{user.remainMin}분</td>
              <td>{user.usedMin}분</td>
              <td>{user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
});

export default UserList;