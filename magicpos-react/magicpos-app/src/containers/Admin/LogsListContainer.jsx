import React, { useState, useEffect } from 'react';
import LogsList from '../../components/Admin/LogsList';
import { getLogList } from '../../apis/loglist';

const LogsListContainer = () => {
  // ✅ 상태 관리
  const [logList, setLogList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    start: 1,
    end: 1,
    last: 1
  });
  const [loading, setLoading] = useState(false);
  
  // ✅ 검색 필터 상태 (기본값 오늘 날짜)
  const [filters, setFilters] = useState({
    type: '',
    keyword: '',
    startDate: new Date().toISOString().split('T')[0], // 오늘 날짜
    endDate: new Date().toISOString().split('T')[0]    // 오늘 날짜
  });

  // ✅ 로그 데이터 로드
  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      console.log("📥 로그 데이터 로딩 시작:", { ...filters, page });
      
      const params = {
        page,
        size: pagination.size,
        ...filters
      };
      
      const response = await getLogList(params);
      
      console.log("✅ 로그 데이터 로드 성공:", response.data);
      
      if (response.data.success) {
        setLogList(response.data.logList || []);
        setPagination(response.data.pagination || pagination);
      } else {
        throw new Error(response.data.message || '로그 조회 실패');
      }
      
    } catch (error) {
      console.error("❌ 로그 데이터 로드 실패:", error);
      alert('로그 데이터를 불러오는데 실패했습니다.');
      // 빈 데이터로 설정
      setLogList([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadLogs();
  }, []);

  // ✅ 필터 변경 핸들러
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    console.log(`🔄 필터 변경: ${field} = ${value}`);
    
    // type 변경 시 즉시 검색 (기존 동작 유지)
    if (field === 'type') {
      setTimeout(() => {
        loadLogsWithFilters(newFilters, 1);
      }, 100); // 상태 업데이트 후 검색
    }
  };

  // ✅ 새로운 필터로 검색
  const loadLogsWithFilters = async (newFilters, page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        size: pagination.size,
        ...newFilters
      };
      
      const response = await getLogList(params);
      
      if (response.data.success) {
        setLogList(response.data.logList || []);
        setPagination(response.data.pagination || pagination);
      }
      
    } catch (error) {
      console.error("❌ 필터 검색 실패:", error);
      alert('검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 검색 버튼 클릭
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('🔍 검색 버튼 클릭:', filters);
    loadLogs(1);
  };

  // ✅ 페이지 변경
  const handlePageChange = (page) => {
    console.log(`📄 페이지 변경: ${page}`);
    loadLogs(page);
  };

  // ✅ Container에서 Component로 props 전달
  return (
    <LogsList
      // 데이터
      logList={logList}
      pagination={pagination}
      loading={loading}
      filters={filters}
      
      // 이벤트 핸들러
      onFilterChange={handleFilterChange}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
    />
  );
};

export default LogsListContainer;