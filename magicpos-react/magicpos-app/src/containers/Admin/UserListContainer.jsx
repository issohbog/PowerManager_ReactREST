import React, { useState, useEffect, useRef } from 'react';
import UserList from '../../components/Admin/UserList';
import UserModal from '../../components/Admin/modal/UserModal';
import { fetchUsers, saveUser, deleteUser, checkUserId, updateUser, deleteUsers, resetUserPassword } from '../../apis/userList';
import RegisterResultModal from '../../components/Admin/modal/RegisterResultModal';
import EditResultModal from '../../components/Admin/modal/EditResultModal';
import { format } from 'date-fns';
import styles from '../../components/css/UserModal.module.css'
import PasswordResetModal from '../../components/Admin/modal/PasswordResetModal';

const UserListContainer = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0, start: 1, end: 1, last: 1 });
  const [search, setSearch] = useState({ type: '', keyword: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('register'); // 'register' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [idCheckStatus, setIdCheckStatus] = useState(''); // 'error' | 'success'
  const [registerResult, setRegisterResult] = useState(null); // 회원 등록 결과 { savedUser, ...}
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editResult, setEditResult] = useState(null); // 회원 수정 결과 { savedUser, ...}
  const [editModalOpen, setEditModalOpen] = useState(false);  
  const [animationClass, setAnimationClass] = useState(''); // 모달 애니메이션 상태
  const [passwordResetModalOpen, setPasswordResetModalOpen] = useState(false);
  const [resetInfo, setResetInfo] = useState({ username: '', tempPassword: '' });
  const [selectedUserNos, setSelectedUserNos] = useState([]); // 선택된 유저 번호 배열

  const userListRef = useRef();

  // userListRef 를 통해 UserList 컴포넌트의 내부 메서드 clearSelection 을 호출 
  const clearSelection = () => {
    if (userListRef.current && userListRef.current.clearSelection) {
      userListRef.current.clearSelection();
    }
  };

  const clearSelectedUserNos = () => setSelectedUserNos([]);

  // 모든 모달 닫기
  const closeAllModals = () => {
    setModalOpen(false);
    setPasswordResetModalOpen(false);
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.page, search.type, search.keyword]);

  const loadUsers = async () => {
    const response = await fetchUsers({ ...search, page: pagination.page });
    console.log('UserListContainer loadUsers response:', response); // ✅ API 응답 확인용 로그
    const data = response.data || {};           // API 응답 데이터 
    console.log('UserListContainer users:', data.users); // ✅ 사용자 목록 확인용 로그
    console.log('UserListContainer pagination:', data.pagination); // ✅ 페이지네이션 정보 확인용 로그
    setSearch({ type: data.type || '', keyword: data.keyword || '' });
    setUsers(data.users || []);
    setPagination(data.pagination || {
        page: 1,
        size: 10,
        total: 0,
        start: 1,
        end: 1,
        last: 1
    });
  };

  const handleSearch = (type, keyword) => {
    setSearch({ type, keyword });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openModal = (mode, user) => {
    setModalMode(mode);
    setSelectedUser(user || null);
    setIdCheckMessage('');   // 메시지 초기화
    setIdCheckStatus('');    // 상태 초기화
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async (userData) => {
    if (modalMode === 'register') {
      const response = await saveUser(userData);
      console.log('회원등록 응답:', response.data); // 이 로그로 실제 구조 확인
      setRegisterResult(response.data);       // savedUser, message 등 저장
      setRegisterModalOpen(true);             // 등록 완료 모달 오픈
    } else if (modalMode === 'edit') {
      const response = await updateUser(userData);
      setEditResult(response.data);
      setEditModalOpen(true);                 // 수정 완료 모달 오픈
    }
    closeModal();                           // 기존 등록/수정 모달 닫기
    loadUsers();
  };

  const handleDelete = async (userNos) => {
    if (Array.isArray(userNos) && userNos.length > 1) {
      // 여러 명 삭제
      await deleteUsers(userNos);
    } else if (Array.isArray(userNos) && userNos.length === 1) {
      await deleteUser(userNos[0]);
    } else if (typeof userNos === 'number') {
      // 단건 삭제 (수정 모달 에서 삭제 버튼 클릭 시)
      await deleteUser(userNos);
    }

    // 모달이 열려 있는 경우 닫기 애니메이션 실행
    if (modalOpen) {
      setAnimationClass(styles.fadeOut); // 닫기 애니메이션 실행
      setTimeout(() => {
        setModalOpen(false);  // 애니메이션 종료 후 모달 닫기
        console.log('새로고침 전');
        loadUsers();          // 애니메이션 종료 후 사용자 목록 새로고침
        console.log('새로고침 완료');
        clearSelection && clearSelection();   // 선택 초기화
      }, 500);                // 애니메이션 지속 시간과 동일하게 설정
    } else {
      loadUsers();            // 모달이 열려 있지 않은 경우 즉시 새로고침
      clearSelection && clearSelection();
    }
  };

  const handleIdCheck = async (userId) => {
    const response = await checkUserId(userId);
    console.log('UserListContainer handleIdCheck response:', response); // ✅ 아이디 중복 확인 응답 로그
    if (response.data.exists) {
      setIdCheckMessage('이미 사용 중인 아이디입니다.');
      setIdCheckStatus('error');
    } else {
      setIdCheckMessage('사용 가능한 아이디입니다.');
      setIdCheckStatus('success');
    }
  };

  // 비밀번호 초기화
  const handleResetPassword = async (userNo) => {
    try {
      const response = await resetUserPassword(userNo);
      const result = response.data || {};
      console.log('UserListContainer handleResetPassword response:', response); // ✅ 비밀번호 초기화 응답 로그
      if (result.success) {
        console.log(`초기화된 비밀번호: ${result.tempPassword}`); // 디버깅용 로그
        setResetInfo({ username: result.username, tempPassword: result.tempPassword });
        setPasswordResetModalOpen(true);
      } else {
        alert(result.message || '비밀번호 초기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('UserListContainer handleResetPassword error:', error);
      alert('비밀번호 초기화 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (user) => {
    openModal('edit', user); // 수정 모달 열기
  };


  return (
    <div>
      <UserList
        ref={userListRef}
        users={users}
        pagination={pagination}
        onSearch={handleSearch}
        onEdit={(user) => openModal('edit', user)}
        onRegister={() => openModal('register')}
        onDelete={handleDelete}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        onView={(user) => openModal('view', user)}
        clearSelectedUserNos={clearSelectedUserNos}
      />


      {modalOpen && (
        <UserModal
            open={modalOpen}
            mode={modalMode}         // 'register' | 'edit' | 'view'
            user={selectedUser}      // 선택된 회원 정보
            onClose={closeModal}     // 모달 닫기 함수
            onSave={handleSave}      // 저장(등록/수정) 함수
            onDelete={handleDelete}  // 삭제 함수
            onIdCheck={handleIdCheck} // 아이디 중복확인 함수
            idCheckMessage={idCheckMessage} // 중복확인 메시지
            idCheckStatus={idCheckStatus} // 중복확인 상태
            onResetPassword={handleResetPassword} // 비밀번호 초기화 함수
            onEdit={handleEdit} // 회원 수정 함수
            clearSelectedUserNos={clearSelectedUserNos}
        />
      )}

      <RegisterResultModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        result={registerResult}
        clearSelectedUserNos={clearSelectedUserNos}
      />

      <EditResultModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        result={editResult}
        clearSelectedUserNos={clearSelectedUserNos}
      />

      <PasswordResetModal
        open={passwordResetModalOpen}
        onClose={closeAllModals}          // 모든 모달 닫기 
        username={resetInfo.username}
        tempPassword={resetInfo.tempPassword}
        clearSelectedUserNos={clearSelectedUserNos}
      />  
    </div>
  );
};

export default UserListContainer;