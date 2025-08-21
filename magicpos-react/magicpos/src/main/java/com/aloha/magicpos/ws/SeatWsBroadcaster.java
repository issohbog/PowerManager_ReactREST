package com.aloha.magicpos.ws;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.aloha.magicpos.domain.Seats;
import com.aloha.magicpos.domain.event.SeatReservedEvent;
import com.aloha.magicpos.domain.event.SeatLogoutEvent;
import com.aloha.magicpos.service.SeatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SeatWsBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;
    private final SeatService seatService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSeatReserved(SeatReservedEvent e) throws Exception {
        // 1) PATCH: 바뀐 좌석 1개만
        log.info("onSeatReserved 들어옴: {}", e);
        Map<String, Object> patch = new HashMap<>();
        patch.put("type", "PATCH");
        patch.put("updatedAt", Instant.now().toString());
        
        Map<String, Object> seatData = new HashMap<>();
        seatData.put("seatId", e.seatId() != null ? e.seatId() : "");
        seatData.put("status", 1);
        seatData.put("className", "in-use");
        seatData.put("username", e.username() != null ? e.username() : "");
        seatData.put("remainTime", e.remainingTime());
        patch.put("seat", seatData);
        
        log.info("patch 들어옴: {}", patch);
        messagingTemplate.convertAndSend("/topic/admin/seats", patch);

        // 2) SNAPSHOT: 보정용(선택)
        Map<String, List<Seats>> sections = seatService.getSeatSections();
        Map<String, Object> snap = new HashMap<>();
        snap.put("type", "SNAPSHOT");
        snap.put("updatedAt", Instant.now().toString());
        for (String key : new String[]{"topSeats","middleSeats","bottomSeats"}) {
            List<Seats> list = sections.getOrDefault(key, Collections.emptyList());
            List<Map<String,Object>> slim = new ArrayList<>();
            for (Seats s : list) {
                Map<String, Object> seatMap = new HashMap<>();
                seatMap.put("seatId", s.getSeatId() != null ? s.getSeatId() : "");
                seatMap.put("status", s.getSeatStatus() != null ? s.getSeatStatus() : 0);
                seatMap.put("className", s.getClassName() != null ? s.getClassName() : "available");
                seatMap.put("username", s.getUsername() != null ? s.getUsername() : "");
                seatMap.put("remainTime", s.getRemainTime() != null ? s.getRemainTime() : 0);
                slim.add(seatMap);
            }
            snap.put(key, slim);
        }
        log.info("SNAPSHOT 들어옴: {}", snap);
        messagingTemplate.convertAndSend("/topic/admin/seats", snap);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSeatLogout(SeatLogoutEvent e) throws Exception {
        // 1) PATCH: 로그아웃된 좌석 1개만
        log.info("onSeatLogout 들어옴: {}", e);
        Map<String, Object> patch = new HashMap<>();
        patch.put("type", "PATCH");
        patch.put("updatedAt", Instant.now().toString());
        
        Map<String, Object> seatData = new HashMap<>();
        seatData.put("seatId", e.seatId() != null ? e.seatId() : "");
        seatData.put("status", 3); // 청소중
        seatData.put("className", "cleaning");
        seatData.put("username", e.username() != null ? e.username() : ""); // 로그아웃한 사용자명 유지
        seatData.put("remainTime", 0);
        patch.put("seat", seatData);
        
        log.info("logout patch 들어옴: {}", patch);
        messagingTemplate.convertAndSend("/topic/admin/seats", patch);

        // 2) SNAPSHOT: 전체 상태 갱신
        Map<String, List<Seats>> sections = seatService.getSeatSections();
        Map<String, Object> snap = new HashMap<>();
        snap.put("type", "SNAPSHOT");
        snap.put("updatedAt", Instant.now().toString());
        for (String key : new String[]{"topSeats","middleSeats","bottomSeats"}) {
            List<Seats> list = sections.getOrDefault(key, Collections.emptyList());
            List<Map<String,Object>> slim = new ArrayList<>();
            for (Seats s : list) {
                Map<String, Object> seatMap = new HashMap<>();
                seatMap.put("seatId", s.getSeatId() != null ? s.getSeatId() : "");
                seatMap.put("status", s.getSeatStatus() != null ? s.getSeatStatus() : 0);
                seatMap.put("className", s.getClassName() != null ? s.getClassName() : "available");
                seatMap.put("username", s.getUsername() != null ? s.getUsername() : "");
                seatMap.put("remainTime", s.getRemainTime() != null ? s.getRemainTime() : 0);
                slim.add(seatMap);
            }
            snap.put(key, slim);
        }
        log.info("logout SNAPSHOT 들어옴: {}", snap);
        messagingTemplate.convertAndSend("/topic/admin/seats", snap);
    }
}
