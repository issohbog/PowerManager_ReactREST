// package com.aloha.magicpos.service;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.ui.Model;

// import com.aloha.magicpos.domain.Users;
// import com.aloha.magicpos.mapper.LogMapper;
// import com.aloha.magicpos.mapper.UserMapper;
// import com.aloha.magicpos.util.LogHelper;

// import jakarta.servlet.http.HttpSession;
// import lombok.extern.slf4j.Slf4j;

// @Slf4j
// @Service("LoginService")
// public class LoginServiceImpl implements LoginService{
//     @Autowired
//     private UserMapper userMapper;

//     @Autowired
//     private LogMapper logMapper;

//     @Override
//     public boolean login(String id, String password, HttpSession session, Model model) throws Exception {
//         Users user = userMapper.findById(id);
//         if (user == null || !user.getPassword().equals(password)) {
//             model.addAttribute("error", "아이디 또는 비밀번호가 올바르지 않습니다.");
//             return false;
//         }
//         // 로그인 성공 → 세션 저장
//         session.setAttribute("loginUser", user);

//         // ✅ 로그인 로그 기록
//         LogHelper.writeLog(session, "LOGIN", user.getUsername() + " 로그인 성공", logMapper);

//         return true;
//     }

//     @Override
//     public void logout(HttpSession session) throws Exception {
//         Users user = (Users) session.getAttribute("loginUser");
        
//         if (user != null) {
//         // ✅ 로그아웃 로그 기록
//         LogHelper.writeLog(session, "LOGOUT", user.getUsername() + " 로그아웃", logMapper);
//         }
//         session.invalidate();
//     }
    
// }
