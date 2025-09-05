// components/Admin/SeatManagement.jsx
import React, { useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToParentElement } from '@dnd-kit/modifiers';
import styles from '../css/SeatManagement.module.css';
import { useSeatCount } from '../../contexts/SeatCountContext.jsx';

// 드래그 변환을 GRID에 스냅시키는 커스텀 모디파이어
const snapToGridModifier = (gx, gy) => ({ transform }) => {
  if (!transform) return transform;
  return {
    ...transform,
    x: Math.round(transform.x / gx) * gx,
    y: Math.round(transform.y / gy) * gy,
  };
};

// 그룹별 좌석 바운딩 박스(형광펜 레이어 계산)
function computeGroupRects(seats, groups, pad = 12) {
  const TILE_W = 160;
  const TILE_H = 100;
  
  return groups
    .map((g) => {
      const list = seats.filter((s) => s.groupId === g.id);
      if (list.length === 0) return null;
      const xs = list.map((s) => s.x);
      const ys = list.map((s) => s.y);
      const minX = Math.min(...xs) - pad;
      const minY = Math.min(...ys) - pad;
      const maxX = Math.max(...xs) + TILE_W + pad;
      const maxY = Math.max(...ys) + TILE_H + pad;
      return { groupId: g.id, x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    })
    .filter(Boolean);
}

// 전역 색깔 관리를 위한 상수 - 그룹 순서에 따라 일관된 색깔 할당
const SECTION_COLORS = [
  {
    name: 'sky',
    highlight: "rgba(56,189,248,0.18)",   // sky-400 배경
    badge: 'groupBadgeSky'                // 뱃지 클래스
  },
  {
    name: 'emerald', 
    highlight: "rgba(16,185,129,0.18)",   // emerald-500 배경
    badge: 'groupBadgeEmerald'
  },
  {
    name: 'amber',
    highlight: "rgba(245,158,11,0.18)",   // amber-500 배경  
    badge: 'groupBadgeAmber'
  },
  {
    name: 'fuchsia',
    highlight: "rgba(217,70,239,0.18)",   // fuchsia-500 배경
    badge: 'groupBadgeFuchsia'
  },
  {
    name: 'rose',
    highlight: "rgba(244,63,94,0.18)",    // rose-500 배경
    badge: 'groupBadgeRose'
  }
];

// 그룹 순서에 따른 색깔 할당 함수 (ID가 아닌 순서 기준)
const getGroupColorByIndex = (groupIndex) => {
  return SECTION_COLORS[groupIndex % SECTION_COLORS.length];
};

// 이전 배열들 (하위 호환성)
const HIGHLIGHT_COLORS = SECTION_COLORS.map(color => color.highlight);

const SeatManagement = (props) => {
  const { seatCount, setSeatCount } = useSeatCount();
  const {
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
    
    // 상태 변경 함수들
    setSidebarCollapsed,
    setSelectedSeatId,
    setShowPositionInput,
    setSeats,
    setEditMode,
    setEditingGroupId,
    setTempGroupName,
    
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
    
    // 유틸 함수들
    snapPositionToGrid,
    clamp,
    
    // 상수들
    GRID,
    GRID_SIZE,
    TILE_W,
    TILE_H,
    
    // DnD 관련
    startPosRef,
    seatMap
  } = props;


  // totalSeats가 바뀔 때마다 Context seatCount도 동기화
  useEffect(() => {
    if (typeof props.totalSeats === 'number') {
      setSeatCount(props.totalSeats);
    }
  }, [props.totalSeats, setSeatCount]);

  console.log('SeatManagement UI 컴포넌트 렌더링됨');

  // 키보드 이벤트 핸들러 (좌석 미세 조정)
  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log('키 입력:', e.key, 'selectedSeatId:', selectedSeatId, 'editMode:', editMode);
      
      // input 필드에서 타이핑 중일 때는 무시
      if (e.target.tagName === 'INPUT') {
        return;
      }
      
      if (!selectedSeatId || !editMode) return;
      
      const moveStep = e.shiftKey ? GRID_SIZE : 1; // Shift키로 그리드 단위 이동
      let deltaX = 0, deltaY = 0;

      switch (e.key) {
        case 'ArrowLeft':
          deltaX = -moveStep;
          e.preventDefault();
          console.log('왼쪽 이동:', deltaX);
          break;
        case 'ArrowRight':
          deltaX = moveStep;
          e.preventDefault();
          console.log('오른쪽 이동:', deltaX);
          break;
        case 'ArrowUp':
          deltaY = -moveStep;
          e.preventDefault();
          console.log('위쪽 이동:', deltaY);
          break;
        case 'ArrowDown':
          deltaY = moveStep;
          e.preventDefault();
          console.log('아래쪽 이동:', deltaY);
          break;
        case 'Escape':
          setSelectedSeatId(null);
          setShowPositionInput(false);
          closeContextMenu(); // 컨텍스트 메뉴도 닫기
          e.preventDefault();
          break;
        case 'Enter':
          if (e.ctrlKey) {
            setShowPositionInput(!showPositionInput);
            e.preventDefault();
          }
          break;
        default:
          return;
      }

      if (deltaX !== 0 || deltaY !== 0) {
        setSeats(prev => prev.map(seat => {
          if (seat.id === selectedSeatId) {
            // 미세 조정시에는 스냅하지 않고, Shift키 눌렀을 때만 스냅
            const newX = seat.x + deltaX;
            const newY = seat.y + deltaY;
            
            if (e.shiftKey) {
              // Shift키 눌렀을 때는 그리드에 스냅
              const snapped = snapPositionToGrid(newX, newY);
              return { ...seat, x: snapped.x, y: snapped.y };
            } else {
              // 일반 화살표키는 정확한 픽셀 단위 이동
              return { ...seat, x: newX, y: newY };
            }
          }
          return seat;
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSeatId, editMode, GRID_SIZE, snapPositionToGrid, setSelectedSeatId, setShowPositionInput, closeContextMenu, setSeats, showPositionInput]);

  // 컨텍스트 메뉴 닫기 이벤트 리스너
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu, closeContextMenu]);

  // DnD
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragStart = (e) => {
    if (!editMode) return;
    const seatId = String(e.active.id).replace("seat-", "");
    const s = seatMap.get(seatId);
    if (s) startPosRef.current[seatId] = { x: s.x, y: s.y };
  };

  const onDragEnd = (e) => {
    if (!editMode) return;
    const { active, over, delta } = e;
    const seatId = String(active.id).replace("seat-", "");

    // 위치 이동
    setSeats((prev) => {
      return prev.map((s, idx, arr) => {
        if (s.id !== seatId) return s;
        let newX = clamp((startPosRef.current[seatId]?.x ?? s.x) + (delta?.x ?? 0), 8, canvasSize.w - (TILE_W + 8));
        let newY = clamp((startPosRef.current[seatId]?.y ?? s.y) + (delta?.y ?? 0), 8, canvasSize.h - (TILE_H + 8));

        // 좌석끼리 겹침 방지 및 5px 간격 보정
  // 5px 단위로 스냅만 적용 (겹침 허용)
  newX = Math.round(newX / 5) * 5;
  newY = Math.round(newY / 5) * 5;
  return { ...s, x: newX, y: newY };
      });
    });

    // 그룹 드롭
    if (over && String(over.id).startsWith("group-")) {
      const gid = parseInt(String(over.id).replace("group-", ""), 10);
      setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, groupId: gid } : s)));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainLayout}>
        {/* 좌측 패널 */}
        <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
          <Panel title="분단 설정" className={styles.sidebarPanel}>
            {/* 분단별 좌석 현황 요약 */}
            <div className={styles.summarySection}>
              <h4>분단별 현황</h4>
              <div className={styles.summaryGrid}>
                {groups.map((g, idx) => {
                  // SECTION_COLORS 배열의 순서에 따라 일관된 색깔 할당
                  const groupColor = getGroupColorByIndex(idx);
                  const assignedSeats = seats.filter((s) => s.groupId === g.id).length;
                  return (
                    <div key={g.id} className={styles.summaryItem}>
                      <span className={`${styles.groupBadge} ${styles[groupColor.badge]}`}>
                        {g.name}
                      </span>
                      <span className={styles.seatCount}>{assignedSeats}석</span>
                    </div>
                  );
                })}
                <div className={styles.summaryItem}>
                  <span className={styles.unassignedBadge}>미할당</span>
                  <span className={styles.seatCount}>{seats.filter((s) => !s.groupId).length}석</span>
                </div>
              </div>
            </div>

            {/* 분단 개수 설정 */}
            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>분단 수</span>
              <input
                type="number"
                className={styles.numberInput}
                min={1}
                value={groupCount}
                onChange={(e) => handleGroupCountChange(Number(e.target.value))}
              />
            </div>

            {/* 각 분단별 번호 범위 설정 */}
            <div className={styles.groupRangeSection}>
              <h4>분단별 좌석 번호 설정</h4>
              {groups.map((group, idx) => {
                const range = groupRanges.find(r => r.groupId === group.id);
                // SECTION_COLORS 배열의 순서에 따라 일관된 색깔 할당
                const groupColor = getGroupColorByIndex(idx);
                const assignedSeats = seats.filter((s) => s.groupId === group.id).length;
                const isFirstGroup = idx === 0;
                const isLastGroup = idx === groups.length - 1;
                
                return (
                  <div key={group.id} className={styles.groupRangeItem}>
                    <div className={styles.groupHeader}>
                      <span className={`${styles.groupBadge} ${styles[groupColor.badge]}`}>
                        {editingGroupId === group.id ? (
                          <input
                            type="text"
                            value={tempGroupName}
                            onChange={(e) => setTempGroupName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                finishEditingGroupName();
                              } else if (e.key === 'Escape') {
                                cancelEditingGroupName();
                              }
                            }}
                            onBlur={finishEditingGroupName}
                            autoFocus
                            className={styles.groupNameInput}
                          />
                        ) : (
                          <>
                            {group.name}
                            <button
                              className={styles.editButton}
                              onClick={() => startEditingGroupName(group.id, group.name)}
                              title="분단 이름 편집"
                            >
                              ✏️
                            </button>
                          </>
                        )}
                        {isFirstGroup && <span className={styles.constraintBadge}>시작</span>}
                        {isLastGroup && <span className={styles.constraintBadge}>끝</span>}
                      </span>
                      {editingGroupId !== group.id && (
                        <span className={styles.assignedCount}>{assignedSeats}석 할당됨</span>
                      )}
                    </div>
                    <div className={styles.rangeInputs}>
                      <div className={styles.rangeInput}>
                        <label>시작:</label>
                        <input
                          type="number"
                          min="1"
                          max={totalSeats}
                          className={rangeErrors[group.id] ? 'error' : ''}
                          value={range?.startNumber || 1}
                          disabled={isFirstGroup} // 첫 번째 분단의 시작번호는 수정 불가
                          onChange={(e) => {
                            if (isFirstGroup) return; // 첫 번째 분단은 변경 방지
                            handleGroupRangeChange(group.id, 'startNumber', parseInt(e.target.value) || 1);
                          }}
                          title={isFirstGroup ? "첫 번째 분단은 항상 1부터 시작합니다" : ""}
                        />
                      </div>
                      <div className={styles.rangeInput}>
                        <label>끝:</label>
                        <input
                          type="number"
                          min="1"
                          max={totalSeats}
                          className={rangeErrors[group.id] ? 'error' : ''}
                          value={range?.endNumber || 12}
                          disabled={isLastGroup} // 마지막 분단의 끝번호는 수정 불가
                          onChange={(e) => {
                            if (isLastGroup) return; // 마지막 분단은 변경 방지
                            handleGroupRangeChange(group.id, 'endNumber', parseInt(e.target.value) || 12);
                          }}
                          title={isLastGroup ? `마지막 분단은 항상 ${totalSeats}로 끝납니다` : ""}
                        />
                      </div>
                      <div className={styles.rangeInfo}>
                        총 {(range?.endNumber || 12) - (range?.startNumber || 1) + 1}석
                      </div>
                    </div>
                    {rangeErrors[group.id] && (
                      <div className={styles.errorMessage}>
                        ⚠️ {rangeErrors[group.id]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.actionButtons}>
              <button
                className={styles.autoAssignButton}
                onClick={onAutoAssign}
              >
                자동 분배
              </button>
              
              <button
                className={styles.rangeAssignButton}
                onClick={onRangeAssign}
                disabled={Object.keys(rangeErrors).length > 0}
              >
                📋 범위별 분배
              </button>
            </div>
          </Panel>

          <Panel title="좌석 설정" className={styles.sidebarPanel}>
            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>총 좌석</span>
              <input
                type="number"
                className={styles.numberInput}
                min={1}
                value={totalSeats}
                onChange={(e) => handleSeatCountChange(Number(e.target.value))}
              />
              <button 
                className={styles.autoAssignButton}
                onClick={handleAddSeat}
              >
                +1 추가
              </button>
              
              <button 
                className={styles.saveButton}
                onClick={saveSeatLayout}
                title="현재 좌석 배치를 저장합니다"
              >
                배치 저장
              </button>
            </div>
            <p className={styles.helpText}>분단 자동 분배는 위 버튼을 사용하세요.</p>
            <p className={styles.helpText}>💡 좌표는 캔버스 기준으로 저장되어 사이드바 상태와 무관합니다.</p>
          </Panel>

          {/* 좌석 위치 조정 패널 */}
          {selectedSeatId && (
            <Panel title={`선택된 좌석: ${selectedSeatId}`} className={styles.sidebarPanel}>
              <div className={styles.positionControl}>
                <div className={styles.positionInfo}>
                  {(() => {
                    const seat = seats.find(s => s.id === selectedSeatId);
                    return seat ? (
                      <div>
                        <p>캔버스 내 좌표: X={seat.x}, Y={seat.y}</p>
                        <p className={styles.coordinateNote}>
                          ※ 좌표는 캔버스 기준 상대 위치입니다 (사이드바 상태 무관)
                        </p>
                        <div className={styles.keyboardHelp}>
                          <p>📍 화살표 키: 1px씩 미세 이동</p>
                          <p>📍 Shift + 화살표: {GRID_SIZE}px씩 그리드 이동</p>
                          <p>📍 Ctrl + Enter: 좌표 직접 입력 {showPositionInput ? '(열림)' : '(닫힘)'}</p>
                          <p>📍 ESC: 선택 해제</p>
                        </div>
                        
                        {showPositionInput && (
                          <div className={styles.positionInput}>
                            <div className={styles.inputGroup}>
                              <label>X 좌표:</label>
                              <input
                                type="number"
                                step="1"
                                value={seat.x}
                                onChange={(e) => {
                                  const newX = parseInt(e.target.value) || 0;
                                  console.log('X 좌표 변경:', newX);
                                  setSeats(prev => prev.map(s => 
                                    s.id === selectedSeatId 
                                      ? { ...s, x: newX } 
                                      : s
                                  ));
                                }}
                                onBlur={(e) => {
                                  const newX = parseInt(e.target.value) || 0;
                                  console.log('X 좌표 확정:', newX);
                                }}
                              />
                            </div>
                            <div className={styles.inputGroup}>
                              <label>Y 좌표:</label>
                              <input
                                type="number"
                                step="1"
                                value={seat.y}
                                onChange={(e) => {
                                  const newY = parseInt(e.target.value) || 0;
                                  console.log('Y 좌표 변경:', newY);
                                  setSeats(prev => prev.map(s => 
                                    s.id === selectedSeatId 
                                      ? { ...s, y: newY } 
                                      : s
                                  ));
                                }}
                                onBlur={(e) => {
                                  const newY = parseInt(e.target.value) || 0;
                                  console.log('Y 좌표 확정:', newY);
                                }}
                              />
                            </div>
                            <button 
                              className={styles.snapButton}
                              onClick={() => {
                                setSeats(prev => prev.map(s => {
                                  if (s.id === selectedSeatId) {
                                    const snapped = snapPositionToGrid(s.x, s.y);
                                    return { ...s, ...snapped };
                                  }
                                  return s;
                                }));
                              }}
                            >
                              그리드에 맞춤
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </Panel>
          )}
        </div>

        {/* 우측: 캔버스 */}
        <div className={styles.canvasContainer}>
          {/* 사이드바 토글 버튼 */}
          <button 
            className={styles.sidebarToggle}
            onClick={() => {
              console.log('사이드바 토글 클릭됨, 현재 상태:', sidebarCollapsed);
              setSidebarCollapsed(!sidebarCollapsed);
            }}
            title={sidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {sidebarCollapsed ? '📋' : '✕'}
          </button>
          
          <Panel>
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              modifiers={editMode ? [snapToGridModifier(GRID, GRID), restrictToParentElement] : []}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            >
              <div
                className={styles.canvas}
                style={{ 
                  width: canvasSize.w,
                  height: canvasSize.h,
                  minWidth: canvasSize.w,
                  minHeight: canvasSize.h
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedSeatId(null);
                    setShowPositionInput(false);
                  }
                }}
              >
                {/* 그리드 배경 */}
                <div
                  className={styles.gridBackground}
                  style={{
                    backgroundSize: `${GRID * 2}px ${GRID * 2}px`,
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  }}
                />

                {/* 그룹 하이라이트 레이어 */}
                {computeGroupRects(seats, groups, 14).map((rect) => {
                  // 그룹 ID가 아닌 순서 기준으로 색깔 할당
                  const groupIndex = groups.findIndex(g => g.id === rect.groupId);
                  const groupColor = getGroupColorByIndex(groupIndex);
                  return (
                    <div
                      key={rect.groupId}
                      className={styles.highlightLayer}
                      style={{
                        left: rect.x,
                        top: rect.y,
                        width: rect.w,
                        height: rect.h,
                        background: groupColor.highlight,
                      }}
                    />
                  );
                })}

                {/* 좌석들 */}
                {seats.map((s) => (
                  <Seat 
                    key={s.id} 
                    seat={s} 
                    editMode={editMode} 
                    selectedSeatId={selectedSeatId}
                    onSeatClick={setSelectedSeatId}
                    onContextMenu={handleContextMenu}
                    TILE_W={TILE_W}
                    TILE_H={TILE_H}
                  />
                ))}

                {/* 컨텍스트 메뉴 */}
                {contextMenu && (
                  <div
                    className={styles.contextMenu}
                    style={{
                      position: 'fixed',
                      left: contextMenu.x,
                      top: contextMenu.y,
                      zIndex: 1000
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {contextMenu.currentStatus === 'BROKEN' ? (
                      <button
                        className={styles.contextMenuItem}
                        onClick={() => changeSeatStatus(contextMenu.seatId, 'AVAILABLE')}
                      >
                        🔧 수리 완료 (이용가능)
                      </button>
                    ) : (
                      <button
                        className={styles.contextMenuItem}
                        onClick={() => changeSeatStatus(contextMenu.seatId, 'BROKEN')}
                      >
                        ⚠️ 고장으로 변경
                      </button>
                    )}
                  </div>
                )}
              </div>
            </DndContext>
          </Panel>
        </div>
      </div>
    </div>
  );
};

/* ========= 작은 컴포넌트 ========= */

function Panel({ title, children, className }) {
  return (
    <div className={`${styles.panel} ${className || ''}`}>
      {title && <div className={styles.panelTitle}>{title}</div>}
      {children}
    </div>
  );
}

function GroupDrop({ id, name, colorIndex }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  // SECTION_COLORS 배열의 순서에 따라 일관된 색깔 할당
  const colorClasses = ['groupDropSky', 'groupDropEmerald', 'groupDropAmber', 'groupDropFuchsia', 'groupDropRose'];
  const colorClass = colorClasses[colorIndex % colorClasses.length];
  
  return (
    <div
      ref={setNodeRef}
      className={`${styles.groupDrop} ${styles[colorClass]} ${isOver ? styles.groupDropHover : ""}`}
    >
      {name}
    </div>
  );
}

function Seat({ seat, editMode, selectedSeatId, onSeatClick, onContextMenu, TILE_W, TILE_H }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `seat-${seat.id}` });

  const getStatusClass = (status) => {
    switch (status) {
      case 'IN_USE': return styles.seatInUse;
      case 'BROKEN': return styles.seatBroken;
      case 'DISABLED': return styles.seatDisabled;
      default: return styles.seatAvailable;
    }
  };

  const isSelected = selectedSeatId === seat.id;

  const style = {
    left: seat.x,
    top: seat.y,
    width: TILE_W,
    height: TILE_H,
    borderRadius: 3,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    border: isSelected ? '3px solid #3b82f6' : undefined,
    boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.5)' : undefined,
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (editMode && onSeatClick) {
      console.log('좌석 클릭됨:', seat.id);
      onSeatClick(seat.id);
    }
  };

  const handleContextMenu = (e) => {
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, seat.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...(editMode ? { ...listeners, ...attributes } : {})}
      className={`${styles.seat} ${getStatusClass(seat.status)} ${
        editMode ? styles.seatEditMode : styles.seatViewMode
      } ${isDragging ? styles.seatDragging : ""} ${isSelected ? styles.seatSelected : ""}`}
      style={style}
      title={seat.id}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className={styles.seatNumber}>{seat.id}</div>

      <div className={styles.seatInfo}>
        {seat.status === "IN_USE" && <span className={styles.seatUserName}>{seat.userName || "사용중"}</span>}
        {seat.status === "BROKEN" && <Badge color="badgeYellow">고장</Badge>}
        {seat.status === "DISABLED" && <Badge color="badgeRose">장애</Badge>}
      </div>
    </div>
  );
}

function Badge({ color = "badge", children }) {
  return <span className={`${styles.badge} ${styles[color]}`}>{children}</span>;
}

export default SeatManagement;
