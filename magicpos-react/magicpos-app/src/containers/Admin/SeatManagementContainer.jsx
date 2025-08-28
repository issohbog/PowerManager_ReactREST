// containers/Admin/SeatManagementContainer.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SeatManagement from '../../components/Admin/SeatManagement';
import * as seatAPI from '../../apis/seatManagementApi';
import { select } from '../../apis/seatStatus'; // 좌석 현황 API 추가

/* ========= 상수 & 유틸 ========= */

const GRID = 24;                // 스냅 간격
const GRID_SIZE = 20;           // 그리드 스냅 크기 (픽셀)
const TILE_W = 160;             // 타일(좌석) 너비 (좌석 현황과 동일)
const TILE_H = 100;             // 타일 높이 (좌석 현황과 동일)

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// 좌표를 그리드에 맞춰 조정하는 함수
const snapPositionToGrid = (x, y) => {
  return {
    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(y / GRID_SIZE) * GRID_SIZE
  };
};

// 좌석이 겹치지 않는 다음 위치 찾기
const findNextAvailablePosition = (existingSeats) => {
  const seatWidth = 160;
  const seatHeight = 100;
  const gap = 20; // 간격을 늘려서 겹침 방지
  const startX = 30;
  const startY = 30;
  const cols = 6; // 한 줄에 6개씩

  // 두 좌석이 겹치는지 확인하는 함수
  const isOverlapping = (x1, y1, x2, y2) => {
    return !(x1 + seatWidth + gap <= x2 || 
             x2 + seatWidth + gap <= x1 || 
             y1 + seatHeight + gap <= y2 || 
             y2 + seatHeight + gap <= y1);
  };

  // 특정 위치에 좌석을 배치할 수 있는지 확인
  const canPlaceAt = (x, y) => {
    return !existingSeats.some(seat => isOverlapping(x, y, seat.x, seat.y));
  };

  // 행과 열을 순차적으로 확인하여 빈 자리 찾기
  let row = 0;
  let maxAttempts = 100; // 무한 루프 방지
  
  while (maxAttempts > 0) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * (seatWidth + gap);
      const y = startY + row * (seatHeight + gap);
      
      if (canPlaceAt(x, y)) {
        console.log(`빈 자리 발견: x=${x}, y=${y}, row=${row}, col=${col}`);
        return { x, y };
      }
    }
    row++;
    maxAttempts--;
  }
  
  // 모든 정규 위치가 차있다면, 마지막 좌석 오른쪽에 배치
  if (existingSeats.length > 0) {
    const lastSeat = existingSeats[existingSeats.length - 1];
    const newX = lastSeat.x + seatWidth + gap;
    const newY = lastSeat.y;
    
    // 오른쪽 공간이 부족하면 다음 줄로
    if (newX > startX + (cols - 1) * (seatWidth + gap)) {
      return {
        x: startX,
        y: lastSeat.y + seatHeight + gap
      };
    }
    
    console.log(`마지막 좌석 기준 배치: x=${newX}, y=${newY}`);
    return { x: newX, y: newY };
  }

  // 기본 위치 반환
  console.log('기본 위치 반환: x=30, y=30');
  return { x: startX, y: startY };
};

// 초기 좌석 생성 (좌석 현황과 동일한 위치 시스템 사용)
const createSeats = (n) => {
  const seats = [];
  const seatWidth = 160;
  const seatHeight = 100;
  const gap = 10;
  const startX = 30;
  const startY = 30;

  let seatIndex = 0;

  // 상단 12개 좌석 (6x2)
  for (let row = 0; row < 2 && seatIndex < n; row++) {
    for (let col = 0; col < 6 && seatIndex < n; col++) {
      seats.push({
        id: `S${seatIndex + 1}`,
        x: startX + col * (seatWidth + gap),
        y: startY + row * (seatHeight + gap),
        groupId: null,
        status: "AVAILABLE",
        userName: "",
        note: "",
      });
      seatIndex++;
    }
  }

  // 중간 10개 좌석 (5x2)
  const middleStartY = startY + 2 * (seatHeight + gap) + 65;
  for (let row = 0; row < 2 && seatIndex < n; row++) {
    for (let col = 0; col < 5 && seatIndex < n; col++) {
      seats.push({
        id: `S${seatIndex + 1}`,
        x: startX + col * (seatWidth + gap),
        y: middleStartY + row * (seatHeight + gap),
        groupId: null,
        status: "AVAILABLE",
        userName: "",
        note: "",
      });
      seatIndex++;
    }
  }

  // 하단 12개 좌석 (6x2)
  const bottomStartY = middleStartY + 2 * (seatHeight + gap) + 65;
  for (let row = 0; row < 2 && seatIndex < n; row++) {
    for (let col = 0; col < 6 && seatIndex < n; col++) {
      seats.push({
        id: `S${seatIndex + 1}`,
        x: startX + col * (seatWidth + gap),
        y: bottomStartY + row * (seatHeight + gap),
        groupId: null,
        status: "AVAILABLE",
        userName: "",
        note: "",
      });
      seatIndex++;
    }
  }

  return seats;
};

// 스샷 비슷하게 데모 상태 시드
function seedStatuses(list) {
  const broken = [5, 7, 15, 17]; // 고장
  const disabled = [19];         // 장애
  const inUse = [{ id: 'S15', user: "사용자4" }];

  return list.map((s, idx) => {
    if (broken.includes(idx)) return { ...s, status: "BROKEN", note: "고장" };
    if (disabled.includes(idx)) return { ...s, status: "DISABLED", note: "장애" };
    const u = inUse.find((x) => x.id === s.id);
    if (u) return { ...s, status: "IN_USE", userName: u.user };
    return s;
  });
}

const SeatManagementContainer = () => {
  console.log('SeatManagementContainer 렌더링됨');
  
  // 전체 레이아웃 상태
  const [totalSeats, setTotalSeats] = useState(34);
  const [groupCount, setGroupCount] = useState(3);
  const [seats, setSeats] = useState(() => seedStatuses(createSeats(34)));
  const [groups, setGroups] = useState(() =>
    Array.from({ length: 3 }, (_, i) => ({ id: i + 1, name: `${['TOP', 'MIDDLE', 'BOTTOM'][i]}` }))
  );
  const [editMode, setEditMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [showPositionInput, setShowPositionInput] = useState(false);
  
  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState(null);
  
  // 분단 이름 편집 상태
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [tempGroupName, setTempGroupName] = useState('');
  
  // 각 분단의 시작번호와 끝번호 관리
  const [groupRanges, setGroupRanges] = useState(() => 
    groups.map((group, index) => ({
      groupId: group.id,
      startNumber: index * 12 + 1,  // 기본값: 1, 13, 25...
      endNumber: (index + 1) * 12   // 기본값: 12, 24, 36...
    }))
  );
  
  // 범위 겹침 에러 상태
  const [rangeErrors, setRangeErrors] = useState({});

  // 캔버스 크기(뷰포트 기반)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

  // API 연동 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ========== API 연동 함수들 ==========

  // 초기 데이터 로드
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('초기 데이터 로드 중...');
      
      // 1. 분단 정보 로드
      let sections = [];
      try {
        const response = await seatAPI.getAllSections();
        sections = response.data?.data || response.data || [];
        console.log('로드된 분단:', sections);
      } catch (err) {
        console.log('분단 조회 실패 - 기본 분단 생성:', err.message);
        sections = [];
      }
      
      // 2. 분단이 없으면 기본 분단 3개 생성
      if (!sections || sections.length === 0) {
        console.log('분단이 없어서 기본 분단 생성 중...');
        const defaultSections = ['TOP', 'MIDDLE', 'BOTTOM'];
        
        for (let i = 0; i < defaultSections.length; i++) {
          try {
            const response = await seatAPI.createSection({
              sectionName: defaultSections[i],
              sectionOrder: i + 1
            });
            const newSection = response.data?.data || response.data;
            sections.push(newSection);
            console.log(`기본 분단 생성 완료: ${defaultSections[i]}`);
          } catch (createErr) {
            console.error(`분단 ${defaultSections[i]} 생성 실패:`, createErr);
            sections.push({
              no: i + 1,
              sectionName: defaultSections[i],
              sectionOrder: i + 1
            });
          }
        }
      }
      
      // 3. 좌석 현황 API로 실제 좌석 데이터 로드 (상태 포함)
      let allSeats = [];
      try {
        const seatStatusResponse = await select(); // 좌석 현황 API 사용
        const seatStatusData = seatStatusResponse.data;
        console.log('좌석 현황 API 응답:', seatStatusData);
        
        // 새로운 방식: 전체 좌석 배열 사용
        if (seatStatusData.seats && Array.isArray(seatStatusData.seats)) {
          allSeats = seatStatusData.seats;
          console.log('전체 좌석 배열 사용:', allSeats.length, '개');
        } else {
          // 하위 호환성: 기존 방식 (topSeats, middleSeats, bottomSeats)
          const topSeats = seatStatusData.topSeats || [];
          const middleSeats = seatStatusData.middleSeats || [];
          const bottomSeats = seatStatusData.bottomSeats || [];
          allSeats = [...topSeats, ...middleSeats, ...bottomSeats];
          console.log('분단별 좌석 병합:', topSeats.length, middleSeats.length, bottomSeats.length, '-> 총', allSeats.length, '개');
        }
      } catch (err) {
        console.log('좌석 현황 조회 실패:', err.message);
        allSeats = [];
      }

      // 4. 좌석 매핑 정보 로드 (위치 정보)
      let mappings = [];
      try {
        const response = await seatAPI.getAllMappings();
        mappings = response.data?.data || response.data || [];
        console.log('로드된 매핑:', mappings);
      } catch (err) {
        console.log('매핑 조회 실패 - 빈 배열로 처리:', err.message);
        mappings = [];
      }
      
      // 5. 분단 정보를 groups 상태로 변환
      if (sections && sections.length > 0) {
        const loadedGroups = sections.map(section => ({
          id: section.no,
          name: section.sectionName
        }));
        setGroups(loadedGroups);
        setGroupCount(loadedGroups.length);
        
        // 분단 범위를 DB에서 조회하여 설정
        try {
          const rangesResponse = await seatAPI.getGroupRanges();
          const dbRanges = rangesResponse.data?.data || [];
          console.log('🔍 DB에서 조회한 그룹 범위 원본:', dbRanges);
          
          if (dbRanges.length > 0) {
            const ranges = dbRanges.map((range, index) => {
              // startSeat이나 endSeat이 0이면 기본값으로 설정
              let startNumber = range.startSeat || (index * 12 + 1);
              let endNumber = range.endSeat || ((index + 1) * 12);
              
              // 0인 경우도 기본값으로 처리
              if (startNumber === 0) startNumber = index * 12 + 1;
              if (endNumber === 0) endNumber = (index + 1) * 12;
              
              const groupRange = {
                groupId: range.groupId,
                startNumber: startNumber,
                endNumber: endNumber
              };
              
              // top 분단에 대해 특별히 로그 출력
              if (range.groupName === 'top') {
                console.log('🔴 TOP 분단 DB 데이터:', range);
                console.log('🔴 TOP 분단 변환 후:', groupRange);
              }
              
              return groupRange;
            });
            setGroupRanges(ranges);
            console.log('🔍 실제 DB 범위로 설정:', ranges);
          } else {
            // DB에 데이터가 없으면 기본값으로 설정
            const ranges = sections.map((section, index) => ({
              groupId: section.no,
              startNumber: index * 12 + 1,
              endNumber: (index + 1) * 12
            }));
            setGroupRanges(ranges);
            console.log('기본 범위로 설정:', ranges);
          }
        } catch (rangeErr) {
          console.log('그룹 범위 조회 실패 - 기본값 사용:', rangeErr.message);
          // 실패 시 기본값 사용
          const ranges = sections.map((section, index) => ({
            groupId: section.no,
            startNumber: index * 12 + 1,
            endNumber: (index + 1) * 12
          }));
          setGroupRanges(ranges);
        }
      }
      
      // 6. 좌석 정보를 seats 상태로 변환 (실제 상태 + 위치 정보 조합)
      if (allSeats && allSeats.length > 0) {
        const loadedSeats = allSeats.map(seat => {
          // DB 상태 값을 좌석 관리용 상태로 변환
          let managementStatus;
          if (seat.seatStatus === 0 || seat.seatStatus === '0') {
            managementStatus = 'AVAILABLE'; // 이용가능
          } else if (seat.seatStatus === 1 || seat.seatStatus === '1') {
            managementStatus = 'IN_USE'; // 사용중
          } else if (seat.seatStatus === 2 || seat.seatStatus === '2') {
            managementStatus = 'BROKEN'; // 고장
          } else if (seat.seatStatus === 3 || seat.seatStatus === '3') {
            managementStatus = 'CLEANING'; // 청소중
          } else {
            // className으로 폴백 (기존 로직 유지)
            managementStatus = seat.className === 'available' ? 'AVAILABLE' :
                              seat.className === 'occupied' ? 'IN_USE' :
                              seat.className === 'cleaning' ? 'CLEANING' :
                              seat.className === 'out-of-order' ? 'BROKEN' : 'AVAILABLE';
          }

          console.log(`좌석 ${seat.seatId} 상태 변환: DB(${seat.seatStatus}) -> 관리(${managementStatus})`);

          return {
            id: seat.seatId,
            x: seat.positionX || 30, // 좌석 현황 API에서 위치 정보 직접 사용
            y: seat.positionY || 30,
            groupId: seat.sectionNo || null,
            status: managementStatus,
            userName: seat.username || "",
            note: managementStatus === 'BROKEN' ? '고장' : "",
          };
        });
        
        setSeats(loadedSeats);
        setTotalSeats(loadedSeats.length);
        console.log('좌석 데이터 로드 완료 (상태 정보 포함):', loadedSeats.length, '개');
      } else if (mappings && mappings.length > 0) {
        // 좌석 현황이 없지만 매핑이 있는 경우
        const loadedSeats = mappings.map(mapping => ({
          id: mapping.seatId,
          x: mapping.positionX,
          y: mapping.positionY,
          groupId: mapping.sectionNo,
          status: "AVAILABLE",
          userName: "",
          note: "",
        }));
        
        setSeats(loadedSeats);
        setTotalSeats(loadedSeats.length);
      } else {
        // 모든 데이터가 없으면 기본 좌석 생성
        console.log('데이터가 없어 기본 좌석 생성');
        const defaultSeats = seedStatuses(createSeats(34));
        setSeats(defaultSeats);
      }
      
      console.log('초기 데이터 로드 완료');
      
    } catch (err) {
      console.error('초기 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다: ' + err.message);
      
      // 실패 시 기본 데이터 사용
      console.log('오류 발생으로 기본 데이터 사용');
      const defaultSeats = seedStatuses(createSeats(34));
      setSeats(defaultSeats);
      
      // 기본 분단도 설정
      const defaultGroups = [
        { id: 1, name: 'TOP' },
        { id: 2, name: 'MIDDLE' },
        { id: 3, name: 'BOTTOM' }
      ];
      setGroups(defaultGroups);
      setGroupCount(3);
      
      const defaultRanges = [
        { groupId: 1, startNumber: 1, endNumber: 12 },
        { groupId: 2, startNumber: 13, endNumber: 24 },
        { groupId: 3, startNumber: 25, endNumber: 34 }
      ];
      setGroupRanges(defaultRanges);
      
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // ========== 분단 관리 API 연동 함수들 ==========

  // 분단 개수 자동 조정 (API 호출)
  const adjustSectionCount = async (targetCount) => {
    setLoading(true);
    try {
      console.log('분단 개수 조정 시작:', targetCount);
      
      const response = await seatAPI.adjustSectionCount(targetCount);
      const adjustedSections = response.data?.data || response.data || [];
      
      // 로컬 상태 업데이트
      const loadedGroups = adjustedSections.map(section => ({
        id: section.no,
        name: section.sectionName
      }));
      
      setGroups(loadedGroups);
      setGroupCount(targetCount);
      
      console.log('분단 개수 조정 완료:', loadedGroups);
      return { success: true, groups: loadedGroups };
      
    } catch (err) {
      console.error('분단 개수 조정 실패:', err);
      setError('분단 개수 조정에 실패했습니다: ' + err.message);
      return { success: false, groups: [] };
    } finally {
      setLoading(false);
    }
  };

  // 분단 생성
  const createNewSection = async (sectionName) => {
    try {
      const newSection = await seatAPI.createSection({
        sectionName,
        sectionOrder: groups.length + 1
      });
      
      // 로컬 상태 업데이트
      const newGroup = {
        id: newSection.no,
        name: newSection.sectionName
      };
      
      setGroups(prev => [...prev, newGroup]);
      setGroupCount(prev => prev + 1);
      
      console.log('분단 생성 완료:', newGroup);
      return newGroup;
      
    } catch (err) {
      console.error('분단 생성 실패:', err);
      alert('분단 생성에 실패했습니다: ' + err.message);
      throw err;
    }
  };

  // 분단 삭제
  const deleteExistingSection = async (sectionId) => {
    try {
      await seatAPI.deleteSection(sectionId);
      
      // 로컬 상태 업데이트
      setGroups(prev => prev.filter(group => group.id !== sectionId));
      setGroupCount(prev => prev - 1);
      
      // 해당 분단의 좌석들 groupId 제거
      setSeats(prev => prev.map(seat => 
        seat.groupId === sectionId 
          ? { ...seat, groupId: null }
          : seat
      ));
      
      console.log('분단 삭제 완료:', sectionId);
      
    } catch (err) {
      console.error('분단 삭제 실패:', err);
      alert('분단 삭제에 실패했습니다: ' + err.message);
      throw err;
    }
  };

  // 좌석 위치 업데이트 (드래그 앤 드롭 시)
  const updateSeatPositionAPI = async (seatId, newX, newY) => {
    try {
      await seatAPI.updateSeatPosition(seatId, newX, newY);
      console.log(`좌석 ${seatId} 위치 업데이트 완료: (${newX}, ${newY})`);
    } catch (err) {
      console.error('좌석 위치 업데이트 실패:', err);
      // 실패 시에도 로컬 상태는 유지 (사용자 경험 개선)
    }
  };

  // 좌석 배치에 따른 동적 캔버스 크기 계산
  const calculateCanvasSize = (seats) => {
    if (seats.length === 0) return { w: 1450, h: 800 }; // 기본 크기 - width를 1450px로 변경
    
    const seatWidth = 160;
    const seatHeight = 100;
    const padding = 100; // 여유 공간 증가 (60 -> 100)
    
    const maxX = Math.max(...seats.map(s => s.x)) + seatWidth + padding;
    const maxY = Math.max(...seats.map(s => s.y)) + seatHeight + padding;
    
    return {
      w: Math.max(1450, maxX), // 최소 너비를 1450px로 변경
      h: Math.max(800, maxY)   // 최소 높이 증가 (600 -> 800)
    };
  };

  // 범위 겹침 검증 함수
  const validateRanges = (ranges) => {
    console.log('🔍 validateRanges 호출됨, 입력 ranges:', ranges);
    
    const errors = {};
    
    // 유효한 범위만 필터링 (startNumber와 endNumber가 모두 있는 것)
    const validRanges = ranges.filter(range => 
      range.startNumber && range.endNumber && 
      range.startNumber > 0 && range.endNumber > 0
    );
    
    console.log('🔍 유효한 ranges:', validRanges);
    
    if (validRanges.length === 0) {
      console.log('🔍 유효한 범위가 없음, 검증 통과');
      setRangeErrors({});
      return true;
    }
    
    const sortedRanges = [...validRanges].sort((a, b) => a.startNumber - b.startNumber);
    console.log('🔍 정렬된 ranges:', sortedRanges);

    // 기본 유효성 검사
    for (const range of validRanges) {
      const group = groups.find(g => g.id === range.groupId);
      const groupName = group?.name || `그룹${range.groupId}`;
      
      // 시작 번호가 끝 번호보다 큰지 체크
      if (range.startNumber > range.endNumber) {
        errors[range.groupId] = `시작 번호가 끝 번호보다 클 수 없습니다`;
        continue;
      }
      
      // 범위가 총 좌석 수를 초과하는지 체크
      if (range.endNumber > totalSeats) {
        errors[range.groupId] = `좌석 번호는 ${totalSeats}를 초과할 수 없습니다`;
        continue;
      }
      
      if (range.startNumber < 1) {
        errors[range.groupId] = `좌석 번호는 1보다 작을 수 없습니다`;
        continue;
      }
    }
    
    // 이미 에러가 있으면 겹침 검사를 하지 않음
    if (Object.keys(errors).length > 0) {
      console.log('🔍 기본 검증 실패, errors:', errors);
      setRangeErrors(errors);
      return false;
    }
    
    // 범위 겹침 체크 - 매우 간단한 로직
    for (let i = 0; i < sortedRanges.length; i++) {
      for (let j = i + 1; j < sortedRanges.length; j++) {
        const range1 = sortedRanges[i];
        const range2 = sortedRanges[j];
        
        const group1Name = groups.find(g => g.id === range1.groupId)?.name || `그룹${range1.groupId}`;
        const group2Name = groups.find(g => g.id === range2.groupId)?.name || `그룹${range2.groupId}`;
        
        // 단순한 겹침 검사: range1의 끝이 range2의 시작보다 크거나 같으면 겹침
        if (range1.endNumber >= range2.startNumber) {
          console.log(`❌ 겹침 발견: ${group1Name}(${range1.startNumber}-${range1.endNumber}) vs ${group2Name}(${range2.startNumber}-${range2.endNumber})`);
          errors[range1.groupId] = `${group2Name}와 범위 겹침`;
          errors[range2.groupId] = `${group1Name}와 범위 겹침`;
        }
      }
    }
    
    console.log('🔍 최종 errors:', errors);
    setRangeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 분단 개수가 변경될 때 범위도 업데이트
  useEffect(() => {
    const newRanges = groups.map((group, index) => {
      const existingRange = groupRanges.find(r => r.groupId === group.id);
      
      if (index === 0) {
        // 첫 번째 분단은 무조건 1부터 시작
        return {
          groupId: group.id,
          startNumber: 1,
          endNumber: existingRange?.endNumber || Math.floor(totalSeats / groups.length)
        };
      } else if (index === groups.length - 1) {
        // 마지막 분단은 무조건 총 좌석 수로 끝
        return {
          groupId: group.id,
          startNumber: existingRange?.startNumber || (totalSeats - Math.floor(totalSeats / groups.length) + 1),
          endNumber: totalSeats
        };
      } else {
        // 중간 분단들
        return existingRange || {
          groupId: group.id,
          startNumber: index * Math.floor(totalSeats / groups.length) + 1,
          endNumber: (index + 1) * Math.floor(totalSeats / groups.length)
        };
      }
    });
    
    setGroupRanges(newRanges);
    validateRanges(newRanges);
  }, [groups, totalSeats]);

  // 좌석이 변경될 때마다 캔버스 크기 재계산
  useEffect(() => {
    const newSize = calculateCanvasSize(seats);
    setCanvasSize(newSize);
  }, [seats]);

  // DnD 참조
  const startPosRef = useRef({});
  const seatMap = useMemo(() => new Map(seats.map((s) => [s.id, s])), [seats]);

  // 좌석 배치 정보를 서버에 저장 (API 연동)
  const saveSeatLayout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('좌석 배치 저장 시작...');
      
      // 좌석 매핑 데이터 준비
      const mappingsToSave = seats
        .filter(seat => seat.groupId) // 분단이 할당된 좌석만
        .map(seat => ({
          sectionNo: seat.groupId,
          seatId: seat.id,
          positionX: seat.x,
          positionY: seat.y
        }));

      console.log('저장할 매핑 데이터:', mappingsToSave);

      if (mappingsToSave.length === 0) {
        alert('저장할 좌석 매핑이 없습니다. 먼저 좌석을 분단에 할당해주세요.');
        return;
      }

      // 백엔드 API 호출
      const response = await seatAPI.saveLayout(mappingsToSave);
      
      // 디버깅용 로그
      console.log('API 응답 전체:', response);
      console.log('응답 데이터:', response.data);
      
      // axios 응답에서 실제 데이터 추출
      const result = response.data;
      
      if (result.success) {
        alert(`${mappingsToSave.length}개 좌석 배치가 성공적으로 저장되었습니다.`);
        console.log('저장 완료:', result);
      } else {
        throw new Error(result.message || '저장 응답이 실패했습니다.');
      }
      
    } catch (error) {
      console.error('좌석 배치 저장 실패:', error);
      setError('저장에 실패했습니다: ' + error.message);
      alert('좌석 배치 저장에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 그룹 번호 범위 기반 자동 분배
  const onAutoAssign = () => {
    console.log('자동 분배 시작, groupRanges:', groupRanges);
    
    setSeats((prevSeats) =>
      prevSeats.map((seat) => {
        // 좌석 번호에서 숫자 부분 추출 (예: S1 -> 1, S23 -> 23)
        const seatNumber = parseInt(seat.id.replace(/\D/g, ''), 10);
        
        // 해당 좌석 번호가 어느 분단 범위에 속하는지 찾기
        const matchingGroup = groupRanges.find(range => 
          seatNumber >= range.startNumber && seatNumber <= range.endNumber
        );
        
        console.log(`좌석 ${seat.id} (번호: ${seatNumber}) -> 분단 ${matchingGroup?.groupId || '미할당'}`);
        
        return {
          ...seat,
          groupId: matchingGroup ? matchingGroup.groupId : null
        };
      })
    );
    
    console.log('자동 분배 완료');
  };

  // 범위별 분배 (검증 포함)
  const onRangeAssign = async () => {
    console.log('범위별 분배 시작, groupRanges:', groupRanges);
    
    // 1. 기본 범위 검증
    const validationResult = validateRangesForAssignment(groupRanges);
    
    if (!validationResult.isValid) {
      alert(validationResult.message);
      return;
    }
    
    try {
      // 프론트엔드 상태 업데이트
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          // 좌석 번호에서 숫자 부분 추출 (예: S1 -> 1, S23 -> 23)
          const seatNumber = parseInt(seat.id.replace(/\D/g, ''), 10);
          
          // 해당 좌석 번호가 어느 분단 범위에 속하는지 찾기
          const matchingGroup = groupRanges.find(range => 
            seatNumber >= range.startNumber && seatNumber <= range.endNumber
          );
          
          console.log(`좌석 ${seat.id} (번호: ${seatNumber}) -> 분단 ${matchingGroup?.groupId || '미할당'}`);
          
          return {
            ...seat,
            groupId: matchingGroup ? matchingGroup.groupId : null
          };
        })
      );

      // 백엔드 데이터베이스 업데이트 (seat_section_mappings 테이블)
      const groupRangeData = groups.map((group, index) => {
        const range = groupRanges.find(r => r.groupId === group.id);
        return {
          id: group.id,
          name: group.name,
          startSeat: range?.startNumber || 1,
          endSeat: range?.endNumber || 1
        };
      });

      console.log('백엔드 그룹 범위 업데이트 데이터:', groupRangeData);
      
      const response = await seatAPI.updateGroupRanges(groupRangeData);
      
      if (response.data.success) {
        console.log('그룹 범위 업데이트 성공:', response.data.message);
        alert('분단 범위가 성공적으로 저장되었습니다.');
      } else {
        console.error('그룹 범위 업데이트 실패:', response.data.message);
        alert('분단 범위 저장 중 오류가 발생했습니다: ' + response.data.message);
      }
      
    } catch (error) {
      console.error('범위별 분배 중 오류 발생:', error);
      alert('범위별 분배 중 오류가 발생했습니다: ' + error.message);
    }
    
    console.log('범위별 분배 완료');
  };

  // 범위별 분배를 위한 상세 검증 함수
  const validateRangesForAssignment = (ranges) => {
    console.log('🔍 범위별 분배 검증 시작:', ranges);
    
    // 유효한 범위만 필터링
    const validRanges = ranges.filter(range => 
      range.startNumber && range.endNumber && 
      range.startNumber > 0 && range.endNumber > 0
    );
    
    // 1. 빈 범위 체크
    if (validRanges.length === 0) {
      return {
        isValid: false,
        message: "분단 범위가 설정되지 않았습니다. 범위를 올바르게 설정해주세요!"
      };
    }
    
    // 2. 모든 분단이 범위를 가지고 있는지 체크
    if (validRanges.length < groups.length) {
      const missingGroups = groups.filter(group => 
        !validRanges.some(range => range.groupId === group.id)
      );
      const missingNames = missingGroups.map(g => g.name).join(', ');
      return {
        isValid: false,
        message: `일부 분단의 범위가 설정되지 않았습니다: ${missingNames}\n범위를 올바르게 설정해주세요!`
      };
    }
    
    // 3. 기본 유효성 검사
    for (const range of validRanges) {
      const group = groups.find(g => g.id === range.groupId);
      const groupName = group?.name || `그룹${range.groupId}`;
      
      if (range.startNumber > range.endNumber) {
        return {
          isValid: false,
          message: `${groupName} 분단의 시작 번호가 끝 번호보다 큽니다.\n범위를 올바르게 설정해주세요!`
        };
      }
      
      if (range.endNumber > totalSeats) {
        return {
          isValid: false,
          message: `${groupName} 분단의 끝 번호가 총 좌석 수(${totalSeats})를 초과합니다.\n범위를 올바르게 설정해주세요!`
        };
      }
      
      if (range.startNumber < 1) {
        return {
          isValid: false,
          message: `${groupName} 분단의 시작 번호는 1 이상이어야 합니다.\n범위를 올바르게 설정해주세요!`
        };
      }
    }
    
    // 4. 정렬하여 연속성과 겹침 체크
    const sortedRanges = [...validRanges].sort((a, b) => a.startNumber - b.startNumber);
    
    // 첫 번째 분단이 1부터 시작하는지 체크
    if (sortedRanges[0].startNumber !== 1) {
      const firstGroup = groups.find(g => g.id === sortedRanges[0].groupId);
      return {
        isValid: false,
        message: `첫 번째 분단(${firstGroup?.name})은 1부터 시작해야 합니다.\n범위를 올바르게 설정해주세요!`
      };
    }
    
    // 마지막 분단이 총 좌석 수로 끝나는지 체크
    const lastRange = sortedRanges[sortedRanges.length - 1];
    if (lastRange.endNumber !== totalSeats) {
      const lastGroup = groups.find(g => g.id === lastRange.groupId);
      return {
        isValid: false,
        message: `마지막 분단(${lastGroup?.name})은 ${totalSeats}로 끝나야 합니다.\n범위를 올바르게 설정해주세요!`
      };
    }
    
    // 5. 범위 겹침 및 빈공간 체크
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const currentRange = sortedRanges[i];
      const nextRange = sortedRanges[i + 1];
      
      const currentGroup = groups.find(g => g.id === currentRange.groupId);
      const nextGroup = groups.find(g => g.id === nextRange.groupId);
      
      // 겹침 체크
      if (currentRange.endNumber >= nextRange.startNumber) {
        return {
          isValid: false,
          message: `${currentGroup?.name}와 ${nextGroup?.name} 분단의 범위가 겹칩니다.\n범위를 올바르게 설정해주세요!`
        };
      }
      
      // 빈공간 체크 (연속하지 않는 범위)
      if (currentRange.endNumber + 1 !== nextRange.startNumber) {
        const missingStart = currentRange.endNumber + 1;
        const missingEnd = nextRange.startNumber - 1;
        return {
          isValid: false,
          message: `좌석 ${missingStart}${missingEnd > missingStart ? `-${missingEnd}` : ''}번이 어느 분단에도 할당되지 않았습니다.\n미할당된 좌석이 있습니다. 좌석의 범위를 올바르게 설정하세요!`
        };
      }
    }
    
    return { isValid: true, message: "검증 통과" };
  };

  // 분단 이름 편집 시작
  const startEditingGroupName = (groupId, currentName) => {
    setEditingGroupId(groupId);
    setTempGroupName(currentName);
  };

  // 분단 이름 편집 완료 (API 연동)
  const finishEditingGroupName = async () => {
    if (!tempGroupName.trim() || !editingGroupId) {
      setEditingGroupId(null);
      setTempGroupName('');
      return;
    }

    try {
      // 백엔드 API 호출
      await seatAPI.updateSection(editingGroupId, {
        sectionName: tempGroupName.trim(),
        sectionOrder: groups.find(g => g.id === editingGroupId)?.sectionOrder || 1
      });

      // 로컬 상태 업데이트
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === editingGroupId 
            ? { ...group, name: tempGroupName.trim() }
            : group
        )
      );
      
      console.log(`분단 ${editingGroupId} 이름 변경 완료: ${tempGroupName.trim()}`);
      
    } catch (err) {
      console.error('분단 이름 변경 실패:', err);
      alert('분단 이름 변경에 실패했습니다: ' + err.message);
    } finally {
      setEditingGroupId(null);
      setTempGroupName('');
    }
  };

  // 분단 이름 편집 취소
  const cancelEditingGroupName = () => {
    setEditingGroupId(null);
    setTempGroupName('');
  };

  // 좌석 상태 변경 함수 (비동기 API 호출 추가)
  const changeSeatStatus = async (seatId, newStatus) => {
    console.log(`🔧 좌석 상태 변경 시도: ${seatId} -> ${newStatus}`);
    
    try {
      // 1. API 호출로 DB에 저장
      const response = await seatAPI.updateSeatStatus(seatId, newStatus);
      
      if (response.data && response.data.success) {
        console.log(`✅ 좌석 상태 변경 성공: ${seatId} -> ${newStatus}`);
        
        // 2. 로컬 상태 업데이트
        setSeats(prevSeats => 
          prevSeats.map(seat => 
            seat.id === seatId 
              ? { ...seat, status: newStatus, note: newStatus === 'BROKEN' ? '고장' : '' }
              : seat
          )
        );
        
        // 3. 성공 알림
        alert(`좌석 ${seatId} 상태가 ${newStatus === 'BROKEN' ? '고장' : '이용가능'}으로 변경되었습니다.`);
        
        // 4. 좌석 현황 새로고침 (다른 화면에서도 바로 확인 가능)
        await loadInitialData();
        
      } else {
        console.error('❌ 좌석 상태 변경 API 실패:', response.data);
        alert('좌석 상태 변경에 실패했습니다: ' + (response.data?.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('❌ 좌석 상태 변경 중 오류:', error);
      alert('좌석 상태 변경 중 오류가 발생했습니다: ' + error.message);
    }
    
    setContextMenu(null); // 컨텍스트 메뉴 닫기
  };

  // 컨텍스트 메뉴 처리
  const handleContextMenu = (e, seatId) => {
    e.preventDefault();
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      seatId: seatId,
      currentStatus: seat.status
    });
  };

  // 컨텍스트 메뉴 닫기
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // 좌석 수 변경 핸들러 (DB 연동)
  const handleSeatCountChange = async (newCount) => {
    console.log('좌석 수 변경됨:', newCount, '현재 좌석 수:', seats.length);
    const currentCount = seats.length;
    
    try {
      if (newCount > currentCount) {
        // 좌석 추가 - DB에 좌석 추가
        console.log('좌석 추가 요청:', newCount - currentCount, '개');
        const seatsToAdd = newCount - currentCount;
        
        for (let i = 0; i < seatsToAdd; i++) {
          const newSeatId = `S${currentCount + i + 1}`;
          const seatNumber = currentCount + i + 1;
          const nextPosition = findNextAvailablePosition(seats);
          
          const seatRequest = {
            seatId: newSeatId,
            seatName: `좌석${seatNumber}`,
            x: nextPosition.x,
            y: nextPosition.y,
            status: "AVAILABLE"
          };
          
          console.log('DB에 좌석 추가 요청:', seatRequest);
          const response = await seatAPI.createSeat(seatRequest);
          console.log('좌석 추가 응답:', response);
          
          // UI 상태 업데이트
          setSeats(prevSeats => [...prevSeats, {
            id: newSeatId,
            x: nextPosition.x,
            y: nextPosition.y,
            groupId: null,
            status: "AVAILABLE",
            userName: "",
            note: "",
          }]);
        }
        
        setTotalSeats(newCount);
        console.log('좌석 추가 완료, 새 총 좌석 수:', newCount);
        
      } else if (newCount < currentCount) {
        // 좌석 제거 - DB에서 좌석 삭제
        console.log('좌석 제거 요청:', currentCount - newCount, '개');
        const seatsToRemove = currentCount - newCount;
        const seatsToDelete = seats.slice(-seatsToRemove); // 마지막 좌석들부터 제거
        
        for (const seat of seatsToDelete) {
          console.log('DB에서 좌석 삭제 요청:', seat.id);
          await seatAPI.deleteSeat(seat.id);
          console.log('좌석 삭제 완료:', seat.id);
        }
        
        // UI 상태 업데이트
        setSeats(prevSeats => prevSeats.slice(0, newCount));
        setTotalSeats(newCount);
        console.log('좌석 제거 완료, 새 총 좌석 수:', newCount);
        
      } else {
        console.log('좌석 수 변화 없음');
        setTotalSeats(newCount);
      }
      
    } catch (error) {
      console.error('좌석 수 변경 중 오류:', error);
      alert('좌석 수 변경에 실패했습니다: ' + (error.response?.data?.message || error.message));
      // 오류 시 원래 상태로 복원
      setTotalSeats(currentCount);
    }
  };

  // 좌석 추가 핸들러
  const handleAddSeat = async () => {
    console.log('좌석 추가 버튼 클릭됨, 현재 좌석 수:', seats.length);
    
    const newTotalSeats = totalSeats + 1;
    const newSeatId = `S${newTotalSeats}`;
    
    try {
      // 1. 먼저 DB에 좌석 생성
      console.log('DB에 새 좌석 생성 중:', newSeatId);
      const createResponse = await seatAPI.createSeat({
        seatId: newSeatId,
        seatName: `좌석${newTotalSeats}`
      });
      
      if (!createResponse.data.success) {
        throw new Error(createResponse.data.message || '좌석 생성 실패');
      }
      
      console.log('DB 좌석 생성 성공:', createResponse.data);
      
      // 2. UI 업데이트
      setTotalSeats(newTotalSeats);
      
      // 현재 좌석 위치들 출력 (디버깅용)
      console.log('기존 좌석 위치들:', seats.map(s => `${s.id}: (${s.x}, ${s.y})`));
      
      // 겹치지 않는 위치 찾기
      const nextPosition = findNextAvailablePosition(seats);
      console.log('새 좌석 배치 위치:', nextPosition);
      
      const newSeat = {
        id: newSeatId,
        x: nextPosition.x,
        y: nextPosition.y,
        groupId: null,
        status: "AVAILABLE",
        userName: "",
        note: "",
      };
      
      console.log('새 좌석 추가:', newSeat);
      
      // 좌석 추가 후 캔버스 크기도 동적으로 조정
      setSeats(prevSeats => {
        const updatedSeats = [...prevSeats, newSeat];
        console.log('업데이트된 전체 좌석 수:', updatedSeats.length);
        return updatedSeats;
      });
      
    } catch (error) {
      console.error('좌석 추가 실패:', error);
      alert('좌석 추가에 실패했습니다: ' + error.message);
    }
  };

  // 분단 개수 변경 핸들러 - API 호출 포함
  const handleGroupCountChange = async (newGroupCount) => {
    console.log('분단 개수 변경 요청:', newGroupCount);
    
    // API를 통해 분단 개수 조정
    const result = await adjustSectionCount(newGroupCount);
    
    if (!result.success) {
      console.log('분단 개수 조정 실패');
      alert('분단 개수 조정에 실패했습니다.');
      return;
    }
    
    // API 성공 시 반환된 그룹 정보로 분단 범위 업데이트
    console.log('분단 개수 조정 완료 - 현재 그룹:', result.groups.length);
    
    // 분단 범위 업데이트 (실제 섹션 ID 사용)
    setGroupRanges(prevRanges => {
      return result.groups.map((group, index) => {
        const existingRange = prevRanges.find(r => r.groupId === group.id);
        return existingRange || {
          groupId: group.id, // 실제 섹션 ID 사용
          startNumber: index * 12 + 1,
          endNumber: (index + 1) * 12
        };
      });
    });
  };

  // 분단 범위 변경 핸들러
  const handleGroupRangeChange = (groupId, field, value) => {
    const newRanges = groupRanges.map(r => 
      r.groupId === groupId 
        ? { ...r, [field]: Math.max(1, Math.min(value, totalSeats)) }
        : r
    );
    setGroupRanges(newRanges);
    validateRanges(newRanges);
  };

  const containerProps = {
    // 상태들
    totalSeats,
    groupCount,
    seats,
    groups,
    editMode,
    sidebarCollapsed,
    selectedSeatId,
    showPositionInput,
    contextMenu,
    editingGroupId,
    tempGroupName,
    groupRanges,
    rangeErrors,
    canvasSize,
    
    // API 연동 상태
    loading,
    error,
    
    // 상태 변경 함수들
    setTotalSeats,
    setGroupCount,
    setSeats,
    setGroups,
    setEditMode,
    setSidebarCollapsed,
    setSelectedSeatId,
    setShowPositionInput,
    setContextMenu,
    setEditingGroupId,
    setTempGroupName,
    setGroupRanges,
    
    // 비즈니스 로직 함수들
    saveSeatLayout,
    onAutoAssign,
    onRangeAssign,
    startEditingGroupName,
    finishEditingGroupName,
    cancelEditingGroupName,
    changeSeatStatus,
    handleContextMenu,
    closeContextMenu,
    handleSeatCountChange,
    handleAddSeat,
    handleGroupCountChange,
    handleGroupRangeChange,
    
    // API 연동 함수들
    loadInitialData,
    createNewSection,
    deleteExistingSection,
    updateSeatPositionAPI,
    
    // 유틸 함수들
    snapPositionToGrid,
    findNextAvailablePosition,
    clamp,
    
    // 상수들
    GRID,
    GRID_SIZE,
    TILE_W,
    TILE_H,
    
    // DnD 관련
    startPosRef,
    seatMap
  };

  return <SeatManagement {...containerProps} />;
};

export default SeatManagementContainer;
