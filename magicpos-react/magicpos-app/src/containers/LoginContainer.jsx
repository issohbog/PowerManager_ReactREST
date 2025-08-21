import React, { useContext, useState } from 'react'
import Login from '../components/Login'
import { LoginContext } from '../contexts/LoginContext'
import JoinContainer from './JoinContainer'
import SelectSeatContainer from './User/SelectSeatContainer'

const LoginContainer = () => {
  const { login } = useContext(LoginContext)
  const [error, setError] = useState('')

  const [showJoinModal, setShowJoinModal] = useState(false)
  const openJoinModal = () => setShowJoinModal(true)
  const closeJoinModal = () => setShowJoinModal(false)

  // ✅ 좌석 모달 상태 및 핸들러 추가
  const [showSeatModal, setShowSeatModal] = useState(false)
  const openSeatModal = () => setShowSeatModal(true)
  const closeSeatModal = () => setShowSeatModal(false)

  const [seatId, setSeatId] = useState("")

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
      <Login
        onLogin={handleLogin}
        error={error}
        onJoinClick={openJoinModal}
        onOpenSeatModal={openSeatModal}
        setSeatId={setSeatId}
        seatId={seatId}
      />
      {showJoinModal && <JoinContainer onClose={closeJoinModal} />}
      {showSeatModal && <SelectSeatContainer onClose={closeSeatModal} setSeatId={setSeatId} />}
    </>
  )
}

export default LoginContainer
