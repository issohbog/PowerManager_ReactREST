import React, { useState, useRef } from 'react'
import JoinModal from '../components/User/modal/JoinModal'
import { join as joinApi, checkId } from '../apis/login'

// 회원가입 비즈니스 로직 컨테이너
const JoinContainer = ({ onClose }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({}) // field level + global
  const [form, setForm] = useState({
    id: '', password: '', username: '', birth: '', gender: '', email: '', phone: ''
  })
  const [idChecking, setIdChecking] = useState(false)
  const [idAvailable, setIdAvailable] = useState(null) // true/false/null
  const lastSubmitRef = useRef(0)
  const idCheckSeq = useRef(0)

  const validateBasic = (form) => {
    const fieldErrors = {}
    if (!form.id) fieldErrors.id = '아이디를 입력해주세요.'
    if (!form.password || form.password.length < 6) fieldErrors.password = '비밀번호는 6자 이상 입력해주세요'
    if (!form.username) fieldErrors.username = '이름을 입력해주세요.'
    if (!/^\d{8}$/.test(form.birth)) fieldErrors.birth = '생년월일은 8자리 (YYYYMMDD) 형식이어야 합니다.'
    if (!form.gender) fieldErrors.gender = '성별을 선택해주세요.'
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) fieldErrors.email = '이메일 형식이 올바르지 않습니다.'
    if (!/^010\d{8}$/.test(form.phone.replace(/\D/g, ''))) fieldErrors.phone = '휴대폰 번호는 010으로 시작해야 하며 11자리여야 합니다.'
    return fieldErrors
  }

  const handleChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }))
    setErrors(e => ({ ...e, [name]: undefined }))
  }

  const handleGender = (gender) => {
    handleChange('gender', gender)
    handleBlur('gender')
  }

  const validators = {
    id: (v) => !v ? '아이디를 입력해주세요.' : (v.length < 4 ? '아이디는 4자 이상' : undefined),
    password: (v) => !v ? '비밀번호를 입력해주세요.' : (v.length < 6 ? '비밀번호는 6자 이상 입력해주세요' : undefined),
    username: (v) => !v ? '이름을 입력해주세요.' : undefined,
    birth: (v) => {
      if (!v) return '생년월일을 입력해주세요.'
      if (!/^\d{8}$/.test(v)) return '생년월일은 8자리 (YYYYMMDD) 형식이어야 합니다.'
      const yyyy = +v.slice(0,4), mm = +v.slice(4,6)-1, dd = +v.slice(6,8)
      const d = new Date(yyyy, mm, dd)
      if (d.getFullYear()!==yyyy || d.getMonth()!==mm || d.getDate()!==dd) return '존재하지 않는 날짜 입니다.'
      return undefined
    },
    gender: (v) => !v ? '성별을 선택해주세요.' : undefined,
    email: (v) => !v ? '이메일을 입력해주세요.' : (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? '이메일 형식이 올바르지 않습니다.' : undefined),
    phone: (v) => {
      if (!v) return '휴대폰 번호를 입력해주세요.'
      const digits = v.replace(/\D/g,'')
      if (!/^010\d{8}$/.test(digits)) return '휴대폰 번호는 010으로 시작해야 하며 11자리여야 합니다.'
      return undefined
    }
  }

  const handleBlur = async (name) => {
    const validator = validators[name]
    if (!validator) return
    const msg = validator(form[name])
    setErrors(e => ({ ...e, [name]: msg }))
    if (msg) return
    if (name === 'id') {
      // 중복 검사
      const seq = ++idCheckSeq.current
      setIdChecking(true)
      try {
        const { data } = await checkId(form.id)
        if (seq !== idCheckSeq.current) return
        if (data.exists) {
          setErrors(e => ({ ...e, id: '이미 사용 중인 아이디입니다.' }))
          setIdAvailable(false)
        } else {
          setErrors(e => ({ ...e, id: undefined }))
          setIdAvailable(true)
        }
      } catch (err) {
        if (seq !== idCheckSeq.current) return
        setErrors(e => ({ ...e, id: '아이디 확인 실패' }))
        setIdAvailable(null)
      } finally {
        if (seq === idCheckSeq.current) setIdChecking(false)
      }
    }
    if (name === 'phone') {
      const digits = form.phone.replace(/\D/g,'')
      if (/^010\d{8}$/.test(digits)) {
        const formatted = digits.replace(/(010)(\d{4})(\d{4})/, '$1-$2-$3')
        setForm(f => ({ ...f, phone: formatted }))
      }
    }
  }

  const handleJoinSubmit = async (rawForm) => {
    setErrors(e => ({ global: e.global }))
    const fieldErrors = validateBasic(rawForm)
    if (Object.keys(fieldErrors).length) {
      setErrors(e => ({ ...e, ...fieldErrors }))
      return
    }

    const birth = rawForm.birth.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
    const phoneDigits = rawForm.phone.replace(/\D/g, '')
    const payload = { ...rawForm, birth, phone: phoneDigits }

    const submitId = ++lastSubmitRef.current
    try {
      setSubmitting(true)
  await joinApi(payload)
      if (submitId !== lastSubmitRef.current) return
      onClose && onClose()
      // TODO: 필요 시 자동 로그인 로직 추가
    } catch (err) {
      if (submitId !== lastSubmitRef.current) return
      setErrors(e => ({ ...e, global: err?.response?.data?.message || err.message || '가입 실패' }))
    } finally {
      if (submitId === lastSubmitRef.current) setSubmitting(false)
    }
  }

  return (
    <JoinModal
      onClose={onClose}
      onSubmit={handleJoinSubmit}
      submitting={submitting}
      errors={errors}
      form={form}
      onChange={handleChange}
      onBlur={handleBlur}
      onSelectGender={handleGender}
      idChecking={idChecking}
      idAvailable={idAvailable}
    />
  )
}

export default JoinContainer
