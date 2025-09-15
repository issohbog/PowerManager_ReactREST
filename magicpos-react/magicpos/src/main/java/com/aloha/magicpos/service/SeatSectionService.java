package com.aloha.magicpos.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.aloha.magicpos.domain.SeatSections;
import com.aloha.magicpos.mapper.SeatSectionMapper;
import com.aloha.magicpos.mapper.SeatSectionMappingMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SeatSectionService {

    @Autowired
    private SeatSectionMapper seatSectionMapper;

    @Autowired
    private SeatSectionMappingMapper seatSectionMappingMapper;

    /**
     * 모든 분단 조회 (순서별 정렬)
     */
    public List<SeatSections> getAllSections() throws Exception {
        log.info("분단 목록 조회");
        return seatSectionMapper.selectAllSections();
    }

    /**
     * 분단 단건 조회
     */
    public SeatSections getSectionById(Long no) throws Exception {
        log.info("분단 조회 - ID: {}", no);
        return seatSectionMapper.selectSectionById(no);
    }

    /**
     * 분단 생성 (기존 비활성 분단 재활용 또는 새로 생성)
     */
    @Transactional
    public SeatSections createSection(SeatSections seatSection) throws Exception {
        log.info("분단 생성 - 이름: {}", seatSection.getSectionName());
        
        // 1. 같은 이름의 비활성 분단이 있는지 확인
        SeatSections existingSection = seatSectionMapper.selectInactiveSectionByName(seatSection.getSectionName());
        
        if (existingSection != null) {
            // 2. 기존 비활성 분단을 재활용
            log.info("기존 비활성 분단 재활용 - ID: {}", existingSection.getNo());
            
            // 순서 자동 설정
            if (seatSection.getSectionOrder() == null) {
                Integer nextOrder = seatSectionMapper.getNextSectionOrder();
                seatSection.setSectionOrder(nextOrder != null ? nextOrder : 1);
            }
            
            // 기존 분단 정보 업데이트 및 활성화
            existingSection.setSectionOrder(seatSection.getSectionOrder());
            existingSection.setMinX(seatSection.getMinX());
            existingSection.setMinY(seatSection.getMinY());
            existingSection.setMaxX(seatSection.getMaxX());
            existingSection.setMaxY(seatSection.getMaxY());
            existingSection.setIsActive(true);
            
            int result = seatSectionMapper.reactivateSection(existingSection);
            if (result > 0) {
                log.info("분단 재활용 성공 - ID: {}", existingSection.getNo());
                return existingSection;
            } else {
                throw new Exception("분단 재활용에 실패했습니다.");
            }
        } else {
            // 3. 새로운 분단 생성
            log.info("새로운 분단 생성");
            
            // 순서 자동 설정
            if (seatSection.getSectionOrder() == null) {
                Integer nextOrder = seatSectionMapper.getNextSectionOrder();
                seatSection.setSectionOrder(nextOrder != null ? nextOrder : 1);
            }
            
            int result = seatSectionMapper.insertSection(seatSection);
            if (result > 0) {
                log.info("분단 생성 성공 - ID: {}", seatSection.getNo());
                return seatSection;
            } else {
                throw new Exception("분단 생성에 실패했습니다.");
            }
        }
    }

    /**
     * 분단 수정
     */
    @Transactional
    public SeatSections updateSection(SeatSections seatSection) throws Exception {
        log.info("분단 수정 - ID: {}, 이름: {}", seatSection.getNo(), seatSection.getSectionName());
        
        int result = seatSectionMapper.updateSection(seatSection);
        if (result > 0) {
            log.info("분단 수정 성공");
            return seatSectionMapper.selectSectionById(seatSection.getNo());
        } else {
            throw new Exception("분단 수정에 실패했습니다.");
        }
    }

    /**
     * 분단 삭제 (관련 매핑도 함께 삭제)
     */
    @Transactional
    public boolean deleteSection(Long no) throws Exception {
        log.info("분단 삭제 - ID: {}", no);
        
        // 삭제할 분단의 순서 조회
        SeatSections sectionToDelete = seatSectionMapper.selectSectionById(no);
        if (sectionToDelete == null) {
            throw new Exception("삭제할 분단을 찾을 수 없습니다.");
        }
        Integer deletedOrder = sectionToDelete.getSectionOrder();
        
        // 관련 좌석 매핑 먼저 삭제
        int mappingDeleteResult = seatSectionMappingMapper.deleteMappingsBySection(no);
        log.info("관련 좌석 매핑 삭제 개수: {}", mappingDeleteResult);
        
        // 분단 삭제
        int result = seatSectionMapper.deleteSection(no);
        if (result > 0) {
            // 삭제된 순서보다 큰 순서들을 1씩 감소시켜 순서 재조정
            if (deletedOrder != null) {
                int reorderResult = seatSectionMapper.reorderSectionsAfterDelete(deletedOrder);
                log.info("순서 재조정 완료 - 영향받은 분단 수: {}", reorderResult);
            }
            log.info("분단 삭제 성공");
            return true;
        } else {
            throw new Exception("분단 삭제에 실패했습니다.");
        }
    }

    /**
     * 분단 순서 변경
     */
    @Transactional
    public boolean updateSectionOrder(Long no, Integer sectionOrder) throws Exception {
        log.info("분단 순서 변경 - ID: {}, 순서: {}", no, sectionOrder);
        
        int result = seatSectionMapper.updateSectionOrder(no, sectionOrder);
        if (result > 0) {
            log.info("분단 순서 변경 성공");
            return true;
        } else {
            throw new Exception("분단 순서 변경에 실패했습니다.");
        }
    }

    /**
     * 분단 영역 업데이트 (좌석 위치 변경 시 자동 호출)
     */
    @Transactional
    public boolean updateSectionBounds(Long no, Integer minX, Integer minY, Integer maxX, Integer maxY) throws Exception {
        log.info("분단 영역 업데이트 - ID: {}, 영역: ({},{}) - ({},{})", no, minX, minY, maxX, maxY);
        
        int result = seatSectionMapper.updateSectionBounds(no, minX, minY, maxX, maxY);
        if (result > 0) {
            log.info("분단 영역 업데이트 성공");
            return true;
        } else {
            log.warn("분단 영역 업데이트 실패");
            return false;
        }
    }

    /**
     * 활성 분단 개수 조회
     */
    public int getActiveSectionCount() throws Exception {
        return seatSectionMapper.countActiveSections();
    }

    /**
     * 분단 이름 중복 검사
     */
    public boolean isSectionNameExists(String sectionName) throws Exception {
        SeatSections existingSection = seatSectionMapper.selectSectionByName(sectionName);
        return existingSection != null;
    }

    /**
     * 분단 개수를 지정된 개수로 자동 조정
     */
    @Transactional
    public boolean adjustSectionCount(int targetCount) throws Exception {
        log.info("분단 개수 조정 - 목표 개수: {}", targetCount);
        
        List<SeatSections> currentSections = getAllSections();
        int currentCount = currentSections.size();
        
        if (targetCount == currentCount) {
            log.info("분단 개수가 이미 목표 개수와 일치: {}", targetCount);
            return true;
        }
        
        if (targetCount > currentCount) {
            // 분단 추가
            String[] sectionNames = {"TOP", "MIDDLE", "BOTTOM", "EXTRA1", "EXTRA2", "EXTRA3", "EXTRA4", "EXTRA5"};
            
            for (int i = currentCount; i < targetCount && i < sectionNames.length; i++) {
                String sectionName = sectionNames[i];
                
                // 1) 먼저 해당 이름의 비활성 분단이 있는지 확인
                SeatSections inactiveSection = seatSectionMapper.selectInactiveSectionByName(sectionName);
                
                if (inactiveSection != null) {
                    // 비활성 분단을 재활용
                    log.info("비활성 분단 재활용: {}", sectionName);
                    
                    // 다음 순서 번호 설정
                    Integer nextOrder = seatSectionMapper.getNextSectionOrder();
                    
                    inactiveSection.setSectionOrder(nextOrder != null ? nextOrder : currentCount + 1);
                    inactiveSection.setMinX(30);
                    inactiveSection.setMinY(30 + i * 200);
                    inactiveSection.setMaxX(1040);
                    inactiveSection.setMaxY(30 + (i + 1) * 200);
                    inactiveSection.setIsActive(true);
                    
                    // 재활성화
                    int result = seatSectionMapper.reactivateSection(inactiveSection);
                    if (result > 0) {
                        log.info("분단 재활성화 성공: {} (순서: {})", sectionName, inactiveSection.getSectionOrder());
                    } else {
                        log.error("분단 재활성화 실패: {}", sectionName);
                    }
                } else {
                    // 2) 비활성 분단이 없으면 새로 생성
                    SeatSections newSection = new SeatSections();
                    
                    // 이미 존재하는 활성 이름인지 확인하여 고유한 이름 생성
                    int suffix = 1;
                    while (isSectionNameExists(sectionName)) {
                        sectionName = sectionNames[i] + suffix;
                        suffix++;
                    }
                    
                    newSection.setSectionName(sectionName);
                    
                    // 다음 사용 가능한 순서 번호 자동 설정
                    Integer nextOrder = seatSectionMapper.getNextSectionOrder();
                    newSection.setSectionOrder(nextOrder != null ? nextOrder : currentCount + 1);
                    
                    newSection.setMinX(30);
                    newSection.setMinY(30 + i * 200);
                    newSection.setMaxX(1040);
                    newSection.setMaxY(30 + (i + 1) * 200);
                    newSection.setIsActive(true);
                    
                    createSection(newSection);
                    log.info("분단 새로 생성: {} (순서: {})", newSection.getSectionName(), newSection.getSectionOrder());
                }
            }
        } else {
            // 분단 제거 (역순으로 제거)
            for (int i = currentCount - 1; i >= targetCount; i--) {
                SeatSections section = currentSections.get(i);
                deleteSection(section.getNo());
                log.info("분단 제거: {}", section.getSectionName());
            }
        }
        
        log.info("분단 개수 조정 완료: {} -> {}", currentCount, targetCount);
        return true;
    }
}
