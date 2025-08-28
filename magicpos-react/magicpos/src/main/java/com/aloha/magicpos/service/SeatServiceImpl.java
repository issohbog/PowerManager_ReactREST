package com.aloha.magicpos.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aloha.magicpos.domain.Seats;
import com.aloha.magicpos.mapper.SeatMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("SeatService")
public class SeatServiceImpl implements SeatService {
    
    @Autowired private SeatMapper seatMapper;

    @Autowired private SeatReservationService seatReservationService;

    @Override
    public List<Seats> findAll() throws Exception {
        return seatMapper.findAll();
    }

    @Override
    public List<Seats> findAllSeatWithUsage() {

        
        List<Seats> list = seatMapper.findAllSeatWithUsage();

        // 화면용 className 추가 계산 
        for (Seats seat : list) {

            // System.out.println("seatId = " + seat.getSeatId() + ", remainTime = " + seat.getRemainTime());


            String className = switch (seat.getSeatStatus().intValue()){
                case 2 -> "broken";
                case 3 -> "cleaning"; 
                case 1 -> (seat.getRemainTime() != null && seat.getRemainTime() > 60)
                            ? "in-use-green"
                            : "in-use-red"; 
                default -> "available";
            };
            seat.setClassName(className);
        }
        return list;
    }

    @Override
    public Map<String, List<Seats>> getSeatSections() throws Exception {
        List<Seats> allSeats = findAllSeatWithUsage();

        // 현재 사용 중인 좌석 사용자 정보 불러오기
        List<Map<String, Object>> currentUsage = seatReservationService.findCurrentSeatUsage();

        // ✅ 좌석별로 사용자 정보 매핑
        for (Seats seat : allSeats) {
            for (Map<String, Object> usage : currentUsage) {
                if (seat.getSeatId().equals(usage.get("seat_id"))) {
                    seat.setUsername((String) usage.get("username"));
                    Object value = usage.get("remain_time");
                    if (value != null) {
                        seat.setRemainTime(Long.parseLong(value.toString()));
                    }
                    break;
                }
            }
        }

        List<Seats> top = new ArrayList<>();
        List<Seats> middle = new ArrayList<>();
        List<Seats> bottom = new ArrayList<>();

        for (Seats seat : allSeats) {
            int num = Integer.parseInt(seat.getSeatId().substring(1));
            if (num <= 12) top.add(seat);
            else if (num <= 22) middle.add(seat);
            else bottom.add(seat);
        }
         
        Map<String, List<Seats>> map = new HashMap<>();
        map.put("topSeats", top);
        map.put("middleSeats", middle);
        map.put("bottomSeats", bottom);

        return map;
    }

    // 좌석 상태 변경 (청소중 -> 사용가능)
    @Override
    public boolean clearSeat(String seatId) throws Exception {
        return seatMapper.clearSeat(seatId) > 0;
    }

    @Override
    public Seats findById(String seatId) throws Exception {
        return seatMapper.findById(seatId);
    }

    @Override
    public boolean updateStatus(String seatId, String seatStatus) throws Exception {
        return seatMapper.updateStatus(seatId, seatStatus) > 0; 
    }

    @Override
    public Map<String, Object> findSeatUsageInfo(String seatId) throws Exception {
        return seatMapper.findSeatUsageInfo(seatId);
    }


    @Override
    public Map<String, Object> findSeatUsageInfoByUser(Long userNo) throws Exception {
        return seatMapper.findSeatUsageInfoByUser(userNo);
    }

    @Override
    public int countUsingSeats() throws Exception {
        return seatMapper.countUsingSeats();
    }

    @Override
    public int countAllSeats() throws Exception {
        return seatMapper.countAllSeats();
    }

    @Override
    public List<String> findReservedSeatIds() {
        return seatMapper.findReservedSeatIds();
    }

    @Override
    public List<String> findAvailableSeatIds() {
        return seatMapper.findAvailableSeatIds();
    }

    @Override
    public List<Map<String, Object>> searchActiveUsers(String keyword) {
        List<Map<String, Object>> rawList;
        if (keyword == null || keyword.trim().isEmpty()) {
            rawList = seatMapper.findInUseUsers();
        } else {
            rawList = seatMapper.searchInUseUsersByKeyword("%" + keyword.trim() + "%");
        }

        List<Map<String, Object>> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Map<String, Object> user : rawList) {
            Object endTimeObj = user.get("end_time");
            long remainSeconds = 0;
            if (endTimeObj != null) {
                LocalDateTime endTime;
                if (endTimeObj instanceof java.sql.Timestamp) {
                    endTime = ((java.sql.Timestamp) endTimeObj).toLocalDateTime();
                } else if (endTimeObj instanceof LocalDateTime) {
                    endTime = (LocalDateTime) endTimeObj;
                } else {
                    // 문자열로 넘어올 경우 파싱
                    endTime = LocalDateTime.parse(endTimeObj.toString().replace(" ", "T"));
                }
                remainSeconds = Duration.between(now, endTime).getSeconds();
                if (remainSeconds < 0) remainSeconds = 0;
            }
            user.put("remain_seconds", remainSeconds);
            result.add(user);
        }
        return result;
    }

    // 좌석 상태 조회
    @Override
    public int getSeatStatus(String seatId) throws Exception {
        return seatMapper.getSeatStatus(seatId);
    }

    // ========== 좌석 생성/삭제 ==========
    
    @Override
    public boolean createSeat(String seatId, String seatName) throws Exception {
        log.info("좌석 생성 - ID: {}, Name: {}", seatId, seatName);
        
        // 중복 체크
        Seats existingSeat = seatMapper.findById(seatId);
        if (existingSeat != null) {
            throw new Exception("이미 존재하는 좌석 ID입니다: " + seatId);
        }
        
        int result = seatMapper.createSeat(seatId, seatName);
        return result > 0;
    }
    
    @Override
    public boolean deleteSeat(String seatId) throws Exception {
        log.info("좌석 삭제 - ID: {}", seatId);
        
        // 좌석 존재 확인
        Seats seat = seatMapper.findById(seatId);
        if (seat == null) {
            throw new Exception("존재하지 않는 좌석 ID입니다: " + seatId);
        }
        
        // 사용중인 좌석인지 확인
        int status = seatMapper.getSeatStatus(seatId);
        if (status == 1) { // 사용중
            throw new Exception("사용중인 좌석은 삭제할 수 없습니다: " + seatId);
        }
        
        int result = seatMapper.deleteSeat(seatId);
        return result > 0;
    }

    @Override
    public boolean updateGroupRanges(List<Map<String, Object>> groupRanges) throws Exception {
        log.info("그룹 범위 업데이트 시작: {}", groupRanges);
        
        try {
            for (Map<String, Object> groupRange : groupRanges) {
                String groupName = (String) groupRange.get("name");
                Number startSeatNum = (Number) groupRange.get("startSeat");
                Number endSeatNum = (Number) groupRange.get("endSeat");
                Number groupIdNum = (Number) groupRange.get("id");
                
                if (startSeatNum == null || endSeatNum == null || groupIdNum == null) {
                    log.warn("필수 값이 누락된 그룹 범위 건너뜀: {}", groupRange);
                    continue;
                }
                
                int startSeat = startSeatNum.intValue();
                int endSeat = endSeatNum.intValue();
                Long groupId = groupIdNum.longValue();
                
                log.info("그룹 '{}' (ID: {}) 범위 업데이트: {}석 ~ {}석", groupName, groupId, startSeat, endSeat);
                
                // 해당 범위의 좌석들을 새로운 그룹으로 업데이트
                for (int seatNum = startSeat; seatNum <= endSeat; seatNum++) {
                    String seatId = String.valueOf(seatNum);
                    int result = seatMapper.updateSeatSectionMapping(seatId, groupId);
                    if (result > 0) {
                        log.debug("좌석 {}번의 section_no가 {}로 업데이트됨", seatId, groupId);
                    }
                }
            }
            
            log.info("모든 그룹 범위 업데이트 완료");
            return true;
            
        } catch (Exception e) {
            log.error("그룹 범위 업데이트 중 오류 발생", e);
            throw e;
        }
    }

    @Override
    public List<Map<String, Object>> getGroupRanges() throws Exception {
        log.info("그룹별 좌석 범위 조회 시작");
        
        try {
            List<Map<String, Object>> groupRanges = seatMapper.getGroupRanges();
            log.info("조회된 그룹 범위: {}", groupRanges);
            return groupRanges;
        } catch (Exception e) {
            log.error("그룹 범위 조회 중 오류 발생", e);
            throw e;
        }
    }

}
