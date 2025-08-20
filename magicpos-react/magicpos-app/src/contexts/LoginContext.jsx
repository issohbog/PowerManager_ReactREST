import React, { createContext, useEffect, useState } from 'react'
import api from '../apis/axios'          // ✅ 네가 가진 axios 인스턴스
import * as auth from '../apis/login'     // ✅ join/login/info 포함
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

// 📦 컨텍스트 생성
export const LoginContext = createContext()

const LoginContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isLogin, setIsLogin]   = useState(() => localStorage.getItem('isLogin') === 'true')
  const [userInfo, setUserInfo] = useState(() => {
    const s = localStorage.getItem('userInfo')
    return s ? JSON.parse(s) : null
  })
  const [roles, setRoles] = useState(() => {
    const s = localStorage.getItem('roles')
    return s ? JSON.parse(s) : { isUser: false, isAdmin: false }
  })

  const navigate = useNavigate()

  // 권한 계산(서버 스키마 양쪽 지원: user.roles 또는 authList[].auth)
  const extractRoles = (data) => {
    const arr =
      data?.user?.roles ??
      data?.roles ??
      (Array.isArray(data?.authList) ? data.authList.map(a => a.auth) : [])
    const roleArr = Array.isArray(arr) ? arr : []
    return {
      isUser: roleArr.includes('ROLE_USER'),
      isAdmin: roleArr.includes('ROLE_ADMIN'),
    }
  }

  // 공통 로그인 세팅
  const applyLogin = ({ token, userData }) => {
    // 토큰 저장: 쿠키(자동로그인) + localStorage(axios 인터셉터)
    Cookies.set('jwt', token, { expires: 5 })
    localStorage.setItem('jwt', token)
    // axios 기본 헤더도 추가(인터셉터와 중복이지만 안전)
    api.defaults.headers.common.Authorization = `Bearer ${token}`

    // 로그인 상태/유저/권한 저장
    setIsLogin(true)
    localStorage.setItem('isLogin', 'true')

    const info = userData?.user ?? userData
    setUserInfo(info)
    localStorage.setItem('userInfo', JSON.stringify(info ?? {}))

    const r = extractRoles(userData?.user ? userData.user : userData)
    setRoles(r)
    localStorage.setItem('roles', JSON.stringify(r))
  }

  // 🔐 로그인 (Login.jsx -> username, password, seatId 전달)
  const login = async (username, password, seatId = null, rememberId = null) => {
    try {
      // 네 auth.js 시그니처: login(username, password, seatId)
      const res = await auth.login(username, password, seatId)
      const headers = res?.headers || {}
      const body = res?.data || {}

      // 토큰: 본문 token → 헤더 Authorization 우선순위
      let token = body?.token
      if (!token && headers?.authorization) {
        token = headers.authorization.replace(/^Bearer\s+/i, '')
      }
      if (!token) throw new Error('TOKEN_MISSING')

      // 상태 적용
      applyLogin({ token, userData: body?.user ? body : body })

      // after-login 훅(있으면 사용, 없으면 조용히 무시)
      try {
        const payload = {
          id: body?.user?.id ?? username,
          seatId,
          rememberId,
        }
        const hook = await api.post('/auth/after-login', payload)
        Swal.fire('로그인 성공', '메인 화면으로 이동합니다.', 'success').then(() => {
          // after-login hook 성공 시에는 window.location.href로 이동
          if (hook?.data?.success && hook?.data?.redirect) {
            window.location.href = hook.data.redirect
            return
          }
          // 권한 분기 기본 라우팅
          const r = extractRoles(body?.user ? body.user : body)
          navigate(r.isAdmin ? '/admin' : '/menu')
        })
      } catch (e) {
        Swal.fire('좌석 오류', '이미 사용 중이거나 고장난 좌석입니다. 다른 좌석을 입력해주세요.', 'error')
      }
    } catch (err) {
      console.error('❌ 로그인 실패:', err)
      Swal.fire('로그인 실패', '아이디 또는 비밀번호를 확인하세요.', 'error')
    }
  }

  // 자동 로그인
  const autoLogin = async () => {
    const jwt = Cookies.get('jwt')
    if (!jwt) return

    // 인터셉터가 localStorage(jwt)를 보기에 동기화
    localStorage.setItem('jwt', jwt)
    api.defaults.headers.common.Authorization = `Bearer ${jwt}`

    try {
      const resp = await auth.info() // 네 auth.js: /users/info
      if (resp?.status === 200 && resp?.data) {
        applyLogin({ token: jwt, userData: resp.data })
      } else {
        throw new Error('UNAUTHORIZED')
      }
    } catch {
      cleanupAuth()
    }
  }

  // 공통 정리
  const cleanupAuth = () => {
    delete api.defaults.headers.common.Authorization
    localStorage.removeItem('jwt')
    Cookies.remove('jwt')

    setIsLogin(false)
    setUserInfo(null)
    setRoles({ isUser: false, isAdmin: false })

    localStorage.removeItem('isLogin')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('roles')
  }

  // 🌞 로그아웃
  const logout = async (force = false) => {
    const doLogout = async () => {
      try {
        // 백엔드 로그아웃 API 호출
        await api.post('/auth/logout')
      } catch (e) {
        console.warn('백엔드 로그아웃 실패(무시):', e)
      }
      cleanupAuth()
      navigate('/')
      Swal.fire('로그아웃', '로그아웃 되었습니다.', 'success')
    }
    if (force) { await doLogout(); return }
    const result = await Swal.fire({
      title: '로그아웃 하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '로그아웃',
      cancelButtonText: '취소'
    })
    if (result.isConfirmed) await doLogout()
  }

  // 마운트 시 자동로그인 시도 + 로딩 해제
  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem('isLogin')
        if (!saved || saved === 'false') {
          await autoLogin()
        }
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LoginContext.Provider value={{ isLogin, login, userInfo, roles, isLoading, logout }}>
      {children}
    </LoginContext.Provider>
  )
}

export default LoginContextProvider
