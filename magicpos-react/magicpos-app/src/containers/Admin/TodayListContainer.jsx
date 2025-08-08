import React, { useState, useEffect } from 'react'
import TodayList from '../../components/Admin/TodayList'
import { getTodayList } from '../../apis/todayList'

const TodayListContainer = () => {
  // ✅ 상태 관리
  const [todayList, setTodayList] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    start: 1,
    end: 1,
    last: 1
  })
  const [loading, setLoading] = useState(false)
  
  // ✅ 검색 필터 상태
  const [filters, setFilters] = useState({
    type: '',
    keyword: ''
  })

  // ✅ 당일내역 데이터 로드
  const loadTodayList = async (page = 1) => {
    try {
      setLoading(true)
      console.log("📥 당일내역 데이터 로딩 시작:", { ...filters, page })
      
      const params = {
        page,
        size: pagination.size,
        ...filters
      }
      
      const response = await getTodayList(params)
      
      console.log("✅ 당일내역 데이터 로드 성공:", response.data)
      
      if (response.data.success) {
        setTodayList(response.data.todayList || [])
        setPagination(response.data.pagination || pagination)
      } else {
        throw new Error(response.data.message || '당일내역 조회 실패')
      }
      
    } catch (error) {
      console.error("❌ 당일내역 데이터 로드 실패:", error)
      alert('당일내역 데이터를 불러오는데 실패했습니다.')
      setTodayList([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadTodayList()
  }, [])

  // ✅ 필터 변경 핸들러
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    
    console.log(`🔄 필터 변경: ${field} = ${value}`)
    
    // type 변경 시 즉시 검색 (기존 동작 유지)
    if (field === 'type') {
      setTimeout(() => {
        loadTodayListWithFilters(newFilters, 1)
      }, 100)
    }
  }

  // ✅ 새로운 필터로 검색
  const loadTodayListWithFilters = async (newFilters, page = 1) => {
    try {
      setLoading(true)
      
      const params = {
        page,
        size: pagination.size,
        ...newFilters
      }
      
      const response = await getTodayList(params)
      
      if (response.data.success) {
        setTodayList(response.data.todayList || [])
        setPagination(response.data.pagination || pagination)
      }
      
    } catch (error) {
      console.error("❌ 필터 검색 실패:", error)
      alert('검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ 검색 버튼 클릭
  const handleSearch = (e) => {
    e.preventDefault()
    console.log('🔍 검색 버튼 클릭:', filters)
    loadTodayList(1)
  }

  // ✅ 페이지 변경
  const handlePageChange = (page) => {
    console.log(`📄 페이지 변경: ${page}`)
    loadTodayList(page)
  }

  // ✅ Container에서 Component로 props 전달
  return (
    <TodayList
      // 데이터
      todayList={todayList}
      pagination={pagination}
      loading={loading}
      filters={filters}
      
      // 이벤트 핸들러
      onFilterChange={handleFilterChange}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
    />
  )
}

export default TodayListContainer