import React, { useContext, useState } from 'react'
import Login from '../components/Login'
import { LoginContext } from '../contexts/LoginContext'
import JoinContainer from './JoinContainer'

const LoginContainer = () => {
  const { login } = useContext(LoginContext)
  const [error, setError] = useState('')

  const [showJoinModal, setShowJoinModal] = useState(false)
  const openJoinModal = () => setShowJoinModal(true)
  const closeJoinModal = () => setShowJoinModal(false)

const handleLogin = async (form) => {
  try {
    // Login.jsx는 username, password, seatId만 줌
    await login(form.username, form.password, form.seatId, form.rememberId)
    setError('')
  } catch (e) {
    console.error('❌ 로그인 에러:', e)
    setError('loginFail')
  }
}

  return (
    <>
      <Login onLogin={handleLogin} error={error} onJoinClick={openJoinModal} />
  {showJoinModal && <JoinContainer onClose={closeJoinModal} />}
    </>
  )
}

export default LoginContainer
