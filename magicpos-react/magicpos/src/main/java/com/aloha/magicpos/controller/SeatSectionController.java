package com.aloha.magicpos.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.magicpos.domain.SeatSections;
import com.aloha.magicpos.service.SeatSectionService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/seat-sections")
public class SeatSectionController {

    @Autowired
    private SeatSectionService seatSectionService;

    /**
     * 모든 분단 조회
     * GET /api/seat-sections
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSections() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<SeatSections> sections = seatSectionService.getAllSections();
            response.put("success", true);
            response.put("data", sections);
            response.put("message", "분단 목록 조회 성공");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("분단 목록 조회 실패", e);
            response.put("success", false);
            response.put("message", "분단 목록 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 분단 단건 조회
     * GET /api/seat-sections/{no}
     */
    @GetMapping("/{no}")
    public ResponseEntity<Map<String, Object>> getSectionById(@PathVariable("no") Long no) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            SeatSections section = seatSectionService.getSectionById(no);
            
            if (section != null) {
                response.put("success", true);
                response.put("data", section);
                response.put("message", "분단 조회 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "해당 분단을 찾을 수 없습니다");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            log.error("분단 조회 실패 - ID: {}", no, e);
            response.put("success", false);
            response.put("message", "분단 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 분단 생성
     * POST /api/seat-sections
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSection(@RequestBody SeatSections seatSection) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 입력 검증
            if (seatSection.getSectionName() == null || seatSection.getSectionName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "분단 이름은 필수입니다");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // 분단 이름 중복 검사
            // if (seatSectionService.isSectionNameExists(seatSection.getSectionName())) {
            //     response.put("success", false);
            //     response.put("message", "이미 존재하는 분단 이름입니다");
            //     return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            // }
            
            SeatSections createdSection = seatSectionService.createSection(seatSection);
            response.put("success", true);
            response.put("data", createdSection);
            response.put("message", "분단 생성 성공");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("분단 생성 실패", e);
            response.put("success", false);
            response.put("message", "분단 생성에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 분단 수정
     * PUT /api/seat-sections/{no}
     */
    @PutMapping("/{no}")
    public ResponseEntity<Map<String, Object>> updateSection(@PathVariable("no") Long no, @RequestBody SeatSections seatSection) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // ID 설정
            seatSection.setNo(no);
            
            // 입력 검증
            if (seatSection.getSectionName() == null || seatSection.getSectionName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "분단 이름은 필수입니다");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            SeatSections updatedSection = seatSectionService.updateSection(seatSection);
            response.put("success", true);
            response.put("data", updatedSection);
            response.put("message", "분단 수정 성공");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("분단 수정 실패 - ID: {}", no, e);
            response.put("success", false);
            response.put("message", "분단 수정에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 분단 삭제
     * DELETE /api/seat-sections/{no}
     */
    @DeleteMapping("/{no}")
    public ResponseEntity<Map<String, Object>> deleteSection(@PathVariable("no") Long no) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean deleted = seatSectionService.deleteSection(no);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "분단 삭제 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "분단 삭제에 실패했습니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            log.error("분단 삭제 실패 - ID: {}", no, e);
            response.put("success", false);
            response.put("message", "분단 삭제에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 분단 순서 변경
     * PUT /api/seat-sections/{no}/order
     */
    @PutMapping("/{no}/order")
    public ResponseEntity<Map<String, Object>> updateSectionOrder(@PathVariable("no") Long no, @RequestBody Map<String, Integer> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Integer sectionOrder = request.get("sectionOrder");
            
            if (sectionOrder == null || sectionOrder < 1) {
                response.put("success", false);
                response.put("message", "올바른 순서 번호를 입력해주세요 (1 이상)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            boolean updated = seatSectionService.updateSectionOrder(no, sectionOrder);
            
            if (updated) {
                response.put("success", true);
                response.put("message", "분단 순서 변경 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "분단 순서 변경에 실패했습니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            log.error("분단 순서 변경 실패 - ID: {}", no, e);
            response.put("success", false);
            response.put("message", "분단 순서 변경에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 활성 분단 개수 조회
     * GET /api/seat-sections/count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getSectionCount() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = seatSectionService.getActiveSectionCount();
            response.put("success", true);
            response.put("count", count);
            response.put("message", "분단 개수 조회 성공");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("분단 개수 조회 실패", e);
            response.put("success", false);
            response.put("message", "분단 개수 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 분단 개수 자동 조정
     * PUT /api/seat-sections/adjust/{targetCount}
     */
    @PutMapping("/adjust/{targetCount}")
    public ResponseEntity<Map<String, Object>> adjustSectionCount(@PathVariable("targetCount") int targetCount) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("=== 분단 개수 조정 요청 수신 ===");
            log.info("목표 개수: {}", targetCount);
            log.info("요청 경로: PUT /seat-sections/adjust/{}", targetCount);
            
            if (targetCount < 1 || targetCount > 8) {
                log.warn("잘못된 분단 개수 요청: {}", targetCount);
                response.put("success", false);
                response.put("message", "분단 개수는 1~8개 사이여야 합니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            log.info("분단 개수 조정 서비스 호출 시작");
            boolean success = seatSectionService.adjustSectionCount(targetCount);
            log.info("분단 개수 조정 서비스 호출 완료: {}", success);
            
            if (success) {
                List<SeatSections> sections = seatSectionService.getAllSections();
                response.put("success", true);
                response.put("data", sections);
                response.put("message", "분단 개수가 " + targetCount + "개로 조정되었습니다.");
                
                log.info("분단 개수 조정 성공: 현재 분단 수 = {}", sections.size());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "분단 개수 조정에 실패했습니다.");
                
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            log.error("분단 개수 조정 실패", e);
            response.put("success", false);
            response.put("message", "분단 개수 조정에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
