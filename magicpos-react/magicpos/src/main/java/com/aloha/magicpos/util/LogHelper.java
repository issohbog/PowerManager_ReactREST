// package com.aloha.magicpos.util;

// import java.sql.Timestamp;
// import java.time.LocalDateTime;

// import com.aloha.magicpos.domain.Logs;
// import com.aloha.magicpos.domain.Users;
// import com.aloha.magicpos.mapper.LogMapper;

// import jakarta.servlet.http.HttpSession;

// public class LogHelper {
//     public static void writeLog(HttpSession session, String actionType, String description, LogMapper logMapper) {
//         Users user = (Users) session.getAttribute("loginUser");
//         if (user == null) return;

//         Logs log = new Logs();
//         log.setUNo(user.getNo());
//         log.setActionType(actionType); // 예: "LOGIN", "ORDER", "TICKET_PURCHASE"
//         log.setDescription(description); // 예: "홍길동 로그인 성공"
//         log.setCreatedAt(Timestamp.valueOf(LocalDateTime.now())); // 시간 자동 기록

//         logMapper.insert(log);
//     }
// }
