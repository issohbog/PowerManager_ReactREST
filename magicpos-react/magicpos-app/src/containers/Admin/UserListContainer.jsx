import React, { useState, useEffect } from 'react';
import UserList from '../../components/Admin/UserList';
import UserModal from '../../components/Admin/modal/UserModal';
import { fetchUsers, saveUser, deleteUser, checkUserId } from '../../apis/userList';

const UserListContainer = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0, start: 1, end: 1, last: 1 });
  const [search, setSearch] = useState({ type: '', keyword: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('register'); // 'register' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [idCheckStatus, setIdCheckStatus] = useState(''); // 'error' | 'success'

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
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async (userData) => {
    await saveUser(userData);
    closeModal();
    loadUsers();
  };

  const handleDelete = async (userId) => {
    await deleteUser(userId);
    loadUsers();
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

  return (
    <div>
      <UserList
        users={users}
        pagination={pagination}
        onSearch={handleSearch}
        onEdit={(user) => openModal('edit', user)}
        onRegister={() => openModal('register')}
        onDelete={handleDelete}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
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
        />
      )} 
    </div>
  );
};

export default UserListContainer;