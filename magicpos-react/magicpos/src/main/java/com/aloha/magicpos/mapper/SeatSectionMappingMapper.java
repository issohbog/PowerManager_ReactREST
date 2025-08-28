package com.aloha.magicpos.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.aloha.magicpos.domain.SeatSectionMappings;

@Mapper
public interface SeatSectionMappingMapper {

    // 전체 매핑 조회 (분단 정보 포함)
    List<SeatSectionMappings> selectAllMappingsWithDetails();

    // 특정 분단의 좌석 매핑 조회
    List<SeatSectionMappings> selectMappingsBySection(@Param("sectionNo") Long sectionNo);

    // 특정 좌석의 매핑 조회
    SeatSectionMappings selectMappingBySeatId(@Param("seatId") String seatId);

    // 좌석 매핑 생성
    int insertMapping(SeatSectionMappings mapping);

    // 좌석 위치 업데이트
    int updateSeatPosition(@Param("seatId") String seatId, 
                          @Param("positionX") Integer positionX, 
                          @Param("positionY") Integer positionY);

    // 좌석 분단 변경
    int updateSeatSection(@Param("seatId") String seatId, @Param("sectionNo") Long sectionNo);

    // 좌석 매핑 삭제
    int deleteMapping(@Param("seatId") String seatId);

    // 분단별 좌석 삭제 (분단 삭제 시)
    int deleteMappingsBySection(@Param("sectionNo") Long sectionNo);

    // 특정 위치에 좌석이 있는지 확인
    int countSeatsAtPosition(@Param("sectionNo") Long sectionNo, 
                            @Param("positionX") Integer positionX, 
                            @Param("positionY") Integer positionY);

    // 분단 내 좌석 개수 조회
    int countSeatsBySection(@Param("sectionNo") Long sectionNo);

    // 매핑되지 않은 좌석 목록 조회
    List<String> selectUnmappedSeats();

    // 좌석 배치 일괄 저장 (기존 매핑 삭제 후 재생성)
    int deleteAllMappings();

    // 좌석 배치 일괄 저장
    int insertMappings(@Param("mappings") List<SeatSectionMappings> mappings);
}
