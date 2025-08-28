package com.aloha.magicpos.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.aloha.magicpos.domain.SeatSections;

@Mapper
public interface SeatSectionMapper {

    // 분단 목록 조회 (순서별 정렬)
    List<SeatSections> selectAllSections();

    // 분단 단건 조회
    SeatSections selectSectionById(@Param("no") Long no);

    // 분단 이름으로 조회
    SeatSections selectSectionByName(@Param("sectionName") String sectionName);

    // 비활성 분단 이름으로 조회
    SeatSections selectInactiveSectionByName(@Param("sectionName") String sectionName);

    // 분단 생성
    int insertSection(SeatSections seatSection);

    // 분단 수정
    int updateSection(SeatSections seatSection);

    // 분단 재활성화
    int reactivateSection(SeatSections seatSection);

    // 분단 삭제
    int deleteSection(@Param("no") Long no);

    // 분단 순서 업데이트
    int updateSectionOrder(@Param("no") Long no, @Param("sectionOrder") Integer sectionOrder);

    // 분단 영역 업데이트 (좌석 위치 변경 시)
    int updateSectionBounds(@Param("no") Long no, 
                           @Param("minX") Integer minX, 
                           @Param("minY") Integer minY, 
                           @Param("maxX") Integer maxX, 
                           @Param("maxY") Integer maxY);

    // 활성 분단 개수 조회
    int countActiveSections();

    // 다음 순서 번호 조회
    Integer getNextSectionOrder();
    
    // 분단 순서 재조정 (삭제된 순서보다 큰 순서들을 1씩 감소)
    int reorderSectionsAfterDelete(@Param("deletedOrder") Integer deletedOrder);
}
