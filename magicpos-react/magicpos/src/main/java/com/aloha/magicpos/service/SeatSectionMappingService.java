package com.aloha.magicpos.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.aloha.magicpos.domain.SeatSectionMappings;
import com.aloha.magicpos.mapper.SeatSectionMappingMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SeatSectionMappingService {

    @Autowired
    private SeatSectionMappingMapper seatSectionMappingMapper;

    @Autowired
    private SeatSectionService seatSectionService;

    /**
     * 전체 좌석 배치 조회 (분단 정보 포함)
     */
    public List<SeatSectionMappings> getAllMappingsWithDetails() throws Exception {
        log.info("전체 좌석 배치 조회");
        return seatSectionMappingMapper.selectAllMappingsWithDetails();
    }

    /**
     * 특정 분단의 좌석 배치 조회
     */
    public List<SeatSectionMappings> getMappingsBySection(Long sectionNo) throws Exception {
        log.info("분단별 좌석 배치 조회 - 분단 ID: {}", sectionNo);
        return seatSectionMappingMapper.selectMappingsBySection(sectionNo);
    }

    /**
     * 특정 좌석의 매핑 정보 조회
     */
    public SeatSectionMappings getMappingBySeatId(String seatId) throws Exception {
        log.info("좌석 매핑 조회 - 좌석 ID: {}", seatId);
        return seatSectionMappingMapper.selectMappingBySeatId(seatId);
    }

    /**
     * 좌석 위치 업데이트
     */
    @Transactional
    public boolean updateSeatPosition(String seatId, Integer positionX, Integer positionY) throws Exception {
        log.info("좌석 위치 업데이트 - 좌석: {}, 위치: ({},{})", seatId, positionX, positionY);
        
        // 기존 매핑 정보 조회
        SeatSectionMappings existingMapping = seatSectionMappingMapper.selectMappingBySeatId(seatId);
        if (existingMapping == null) {
            throw new Exception("해당 좌석의 매핑 정보를 찾을 수 없습니다.");
        }
        
        // 같은 분단 내에서 같은 위치에 다른 좌석이 있는지 확인
        int conflictCount = seatSectionMappingMapper.countSeatsAtPosition(
            existingMapping.getSectionNo(), positionX, positionY);
        
        if (conflictCount > 0) {
            throw new Exception("해당 위치에 이미 다른 좌석이 배치되어 있습니다.");
        }
        
        // 위치 업데이트
        int result = seatSectionMappingMapper.updateSeatPosition(seatId, positionX, positionY);
        if (result > 0) {
            // 분단 영역 자동 업데이트
            updateSectionBoundsForSection(existingMapping.getSectionNo());
            log.info("좌석 위치 업데이트 성공");
            return true;
        } else {
            throw new Exception("좌석 위치 업데이트에 실패했습니다.");
        }
    }

    /**
     * 좌석 분단 변경
     */
    @Transactional
    public boolean moveSeatToSection(String seatId, Long newSectionNo) throws Exception {
        log.info("좌석 분단 변경 - 좌석: {}, 새 분단: {}", seatId, newSectionNo);
        
        // 기존 매핑 정보 조회
        SeatSectionMappings existingMapping = seatSectionMappingMapper.selectMappingBySeatId(seatId);
        if (existingMapping == null) {
            throw new Exception("해당 좌석의 매핑 정보를 찾을 수 없습니다.");
        }
        
        Long oldSectionNo = existingMapping.getSectionNo();
        
        // 분단 변경
        int result = seatSectionMappingMapper.updateSeatSection(seatId, newSectionNo);
        if (result > 0) {
            // 이전 분단과 새 분단의 영역 업데이트
            updateSectionBoundsForSection(oldSectionNo);
            updateSectionBoundsForSection(newSectionNo);
            log.info("좌석 분단 변경 성공");
            return true;
        } else {
            throw new Exception("좌석 분단 변경에 실패했습니다.");
        }
    }

    /**
     * 좌석 매핑 생성
     */
    @Transactional
    public boolean createMapping(SeatSectionMappings mapping) throws Exception {
        log.info("좌석 매핑 생성 - 좌석: {}, 분단: {}, 위치: ({},{})", 
                mapping.getSeatId(), mapping.getSectionNo(), mapping.getPositionX(), mapping.getPositionY());
        
        // 같은 위치에 다른 좌석이 있는지 확인
        int conflictCount = seatSectionMappingMapper.countSeatsAtPosition(
            mapping.getSectionNo(), mapping.getPositionX(), mapping.getPositionY());
        
        if (conflictCount > 0) {
            throw new Exception("해당 위치에 이미 다른 좌석이 배치되어 있습니다.");
        }
        
        int result = seatSectionMappingMapper.insertMapping(mapping);
        if (result > 0) {
            // 분단 영역 자동 업데이트
            updateSectionBoundsForSection(mapping.getSectionNo());
            log.info("좌석 매핑 생성 성공");
            return true;
        } else {
            throw new Exception("좌석 매핑 생성에 실패했습니다.");
        }
    }

    /**
     * 좌석 매핑 삭제
     */
    @Transactional
    public boolean deleteMapping(String seatId) throws Exception {
        log.info("좌석 매핑 삭제 - 좌석: {}", seatId);
        
        // 기존 매핑 정보 조회 (분단 영역 업데이트를 위해)
        SeatSectionMappings existingMapping = seatSectionMappingMapper.selectMappingBySeatId(seatId);
        
        int result = seatSectionMappingMapper.deleteMapping(seatId);
        if (result > 0) {
            // 분단 영역 자동 업데이트
            if (existingMapping != null) {
                updateSectionBoundsForSection(existingMapping.getSectionNo());
            }
            log.info("좌석 매핑 삭제 성공");
            return true;
        } else {
            throw new Exception("좌석 매핑 삭제에 실패했습니다.");
        }
    }

    /**
     * 좌석 배치 일괄 저장 (전체 레이아웃 저장) - UPSERT 방식
     */
    @Transactional
    public boolean saveLayoutBatch(List<SeatSectionMappings> mappings) throws Exception {
        log.info("좌석 배치 일괄 저장 - 매핑 개수: {}", mappings.size());
        
        int insertCount = 0;
        int updateCount = 0;
        
        for (SeatSectionMappings mapping : mappings) {
            // 기존 매핑 확인
            SeatSectionMappings existing = seatSectionMappingMapper.selectMappingBySeatId(mapping.getSeatId());
            
            if (existing != null) {
                // 기존 매핑이 있으면 분단과 위치 UPDATE
                int sectionResult = seatSectionMappingMapper.updateSeatSection(mapping.getSeatId(), mapping.getSectionNo());
                int positionResult = seatSectionMappingMapper.updateSeatPosition(
                    mapping.getSeatId(), mapping.getPositionX(), mapping.getPositionY());
                if (sectionResult > 0 || positionResult > 0) updateCount++;
            } else {
                // 기존 매핑이 없으면 INSERT
                int result = seatSectionMappingMapper.insertMapping(mapping);
                if (result > 0) insertCount++;
            }
        }
        
        log.info("일괄 저장 결과: {} 개 생성, {} 개 업데이트", insertCount, updateCount);
        
        // 모든 분단의 영역 업데이트
        Map<Long, List<SeatSectionMappings>> sectionGroups = mappings.stream()
            .collect(Collectors.groupingBy(SeatSectionMappings::getSectionNo));
        
        for (Long sectionNo : sectionGroups.keySet()) {
            updateSectionBoundsForSection(sectionNo);
        }
        
        log.info("좌석 배치 일괄 저장 완료");
        return true;
    }

    /**
     * 매핑되지 않은 좌석 목록 조회
     */
    public List<String> getUnmappedSeats() throws Exception {
        log.info("매핑되지 않은 좌석 조회");
        return seatSectionMappingMapper.selectUnmappedSeats();
    }

    /**
     * 분단별 좌석 개수 조회
     */
    public int getSeatCountBySection(Long sectionNo) throws Exception {
        return seatSectionMappingMapper.countSeatsBySection(sectionNo);
    }

    /**
     * 특정 분단의 영역(bounds) 자동 계산 및 업데이트
     */
    private void updateSectionBoundsForSection(Long sectionNo) {
        try {
            List<SeatSectionMappings> sectionSeats = seatSectionMappingMapper.selectMappingsBySection(sectionNo);
            
            if (sectionSeats.isEmpty()) {
                // 좌석이 없으면 영역을 0으로 설정
                seatSectionService.updateSectionBounds(sectionNo, 0, 0, 0, 0);
                return;
            }
            
            // 좌석들의 최소/최대 좌표 계산
            int minX = sectionSeats.stream().mapToInt(SeatSectionMappings::getPositionX).min().orElse(0);
            int minY = sectionSeats.stream().mapToInt(SeatSectionMappings::getPositionY).min().orElse(0);
            int maxX = sectionSeats.stream().mapToInt(SeatSectionMappings::getPositionX).max().orElse(0);
            int maxY = sectionSeats.stream().mapToInt(SeatSectionMappings::getPositionY).max().orElse(0);
            
            // 좌석 크기를 고려하여 여유 공간 추가 (좌석 크기: 160x100)
            maxX += 160;
            maxY += 100;
            
            seatSectionService.updateSectionBounds(sectionNo, minX, minY, maxX, maxY);
            log.debug("분단 {} 영역 업데이트: ({},{}) - ({},{})", sectionNo, minX, minY, maxX, maxY);
            
        } catch (Exception e) {
            log.error("분단 영역 업데이트 실패 - 분단 ID: {}", sectionNo, e);
        }
    }
}
