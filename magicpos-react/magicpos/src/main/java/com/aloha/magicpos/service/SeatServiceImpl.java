package com.aloha.magicpos.service;

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
        if (keyword == null || keyword.trim().isEmpty()) {
            return seatMapper.findInUseUsers();
        } else {
            return seatMapper.searchInUseUsersByKeyword("%" + keyword.trim() + "%");
        }
    }



}
