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

import com.aloha.magicpos.domain.SeatSectionMappings;
import com.aloha.magicpos.service.SeatSectionMappingService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/seat-mappings")
public class SeatMappingController {

    @Autowired
    private SeatSectionMappingService seatSectionMappingService;



    /**
     * 전체 좌석 배치 조회 (분단 정보 포함)
     * GET /api/seat-mappings
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllMappings() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<SeatSectionMappings> mappings = seatSectionMappingService.getAllMappingsWithDetails();
            response.put("success", true);
            response.put("data", mappings);
            response.put("message", "좌석 배치 조회 성공");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("좌석 배치 조회 실패", e);
            response.put("success", false);
            response.put("message", "좌석 배치 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 특정 분단의 좌석 배치 조회
     * GET /api/seat-mappings/section/{sectionNo}
     */
    @GetMapping("/section/{sectionNo}")
    public ResponseEntity<Map<String, Object>> getMappingsBySection(@PathVariable Long sectionNo) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<SeatSectionMappings> mappings = seatSectionMappingService.getMappingsBySection(sectionNo);
            response.put("success", true);
            response.put("data", mappings);
            response.put("message", "분단별 좌석 배치 조회 성공");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("분단별 좌석 배치 조회 실패 - 분단 ID: {}", sectionNo, e);
            response.put("success", false);
            response.put("message", "분단별 좌석 배치 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 특정 좌석의 매핑 정보 조회
     * GET /api/seat-mappings/seat/{seatId}
     */
    @GetMapping("/seat/{seatId}")
    public ResponseEntity<Map<String, Object>> getMappingBySeatId(@PathVariable String seatId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            SeatSectionMappings mapping = seatSectionMappingService.getMappingBySeatId(seatId);
            
            if (mapping != null) {
                response.put("success", true);
                response.put("data", mapping);
                response.put("message", "좌석 매핑 조회 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "해당 좌석의 매핑 정보를 찾을 수 없습니다");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            log.error("좌석 매핑 조회 실패 - 좌석 ID: {}", seatId, e);
            response.put("success", false);
            response.put("message", "좌석 매핑 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 좌석 위치 업데이트 (드래그 앤 드롭)
     * PUT /api/seat-mappings/seat/{seatId}/position
     */
    @PutMapping("/seat/{seatId}/position")
    public ResponseEntity<Map<String, Object>> updateSeatPosition(@PathVariable String seatId, @RequestBody Map<String, Integer> position) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Integer positionX = position.get("positionX");
            Integer positionY = position.get("positionY");
            
            if (positionX == null || positionY == null) {
                response.put("success", false);
                response.put("message", "X, Y 좌표가 필요합니다");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            boolean updated = seatSectionMappingService.updateSeatPosition(seatId, positionX, positionY);
            
            if (updated) {
                response.put("success", true);
                response.put("message", "좌석 위치 업데이트 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "좌석 위치 업데이트에 실패했습니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            log.error("좌석 위치 업데이트 실패 - 좌석 ID: {}", seatId, e);
            response.put("success", false);
            response.put("message", "좌석 위치 업데이트에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 좌석 분단 변경
     * PUT /api/seat-mappings/seat/{seatId}/section
     */
    @PutMapping("/seat/{seatId}/section")
    public ResponseEntity<Map<String, Object>> moveSeatToSection(@PathVariable String seatId, @RequestBody Map<String, Long> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long sectionNo = request.get("sectionNo");
            
            if (sectionNo == null) {
                response.put("success", false);
                response.put("message", "분단 번호가 필요합니다");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            boolean moved = seatSectionMappingService.moveSeatToSection(seatId, sectionNo);
            
            if (moved) {
                response.put("success", true);
                response.put("message", "좌석 분단 변경 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "좌석 분단 변경에 실패했습니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            log.error("좌석 분단 변경 실패 - 좌석 ID: {}", seatId, e);
            response.put("success", false);
            response.put("message", "좌석 분단 변경에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 좌석 매핑 생성
     * POST /api/seat-mappings
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createMapping(@RequestBody SeatSectionMappings mapping) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 입력 검증
            if (mapping.getSeatId() == null || mapping.getSectionNo() == null) {
                response.put("success", false);
                response.put("message", "좌석 ID와 분단 번호는 필수입니다");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            boolean created = seatSectionMappingService.createMapping(mapping);
            
            if (created) {
                response.put("success", true);
                response.put("message", "좌석 매핑 생성 성공");
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                response.put("success", false);
                response.put("message", "좌석 매핑 생성에 실패했습니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            log.error("좌석 매핑 생성 실패", e);
            response.put("success", false);
            response.put("message", "좌석 매핑 생성에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 좌석 매핑 삭제
     * DELETE /api/seat-mappings/seat/{seatId}
     */
    @DeleteMapping("/seat/{seatId}")
    public ResponseEntity<Map<String, Object>> deleteMapping(@PathVariable String seatId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean deleted = seatSectionMappingService.deleteMapping(seatId);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "좌석 매핑 삭제 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "좌석 매핑 삭제에 실패했습니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            log.error("좌석 매핑 삭제 실패 - 좌석 ID: {}", seatId, e);
            response.put("success", false);
            response.put("message", "좌석 매핑 삭제에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 좌석 배치 일괄 저장 (전체 레이아웃 저장)
     * POST /api/seat-mappings/layout
     */
    @PostMapping("/layout")
    public ResponseEntity<Map<String, Object>> saveLayout(@RequestBody List<SeatSectionMappings> mappings) {
        Map<String, Object> response = new HashMap<>();

         // 디버깅용 로그 (처음 몇 개만)
            mappings.stream().limit(5).forEach(m ->
                log.info("insert seat mapping: sectionNo={}, seatId='{}', x={}, y={}",
                    m.getSectionNo(), m.getSeatId(), m.getPositionX(), m.getPositionY())
            );
        
        try {
            boolean saved = seatSectionMappingService.saveLayoutBatch(mappings);
            
            if (saved) {
                response.put("success", true);
                response.put("message", "좌석 배치 저장 성공");
                response.put("savedCount", mappings.size());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "좌석 배치 저장에 실패했습니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            log.error("좌석 배치 저장 실패", e);
            response.put("success", false);
            response.put("message", "좌석 배치 저장에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 매핑되지 않은 좌석 목록 조회
     * GET /api/seat-mappings/unmapped
     */
    @GetMapping("/unmapped")
    public ResponseEntity<Map<String, Object>> getUnmappedSeats() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<String> unmappedSeats = seatSectionMappingService.getUnmappedSeats();
            response.put("success", true);
            response.put("data", unmappedSeats);
            response.put("count", unmappedSeats.size());
            response.put("message", "매핑되지 않은 좌석 조회 성공");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("매핑되지 않은 좌석 조회 실패", e);
            response.put("success", false);
            response.put("message", "매핑되지 않은 좌석 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 분단별 좌석 개수 조회
     * GET /api/seat-mappings/section/{sectionNo}/count
     */
    @GetMapping("/section/{sectionNo}/count")
    public ResponseEntity<Map<String, Object>> getSeatCountBySection(@PathVariable Long sectionNo) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = seatSectionMappingService.getSeatCountBySection(sectionNo);
            response.put("success", true);
            response.put("count", count);
            response.put("message", "분단별 좌석 개수 조회 성공");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("분단별 좌석 개수 조회 실패 - 분단 ID: {}", sectionNo, e);
            response.put("success", false);
            response.put("message", "분단별 좌석 개수 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
