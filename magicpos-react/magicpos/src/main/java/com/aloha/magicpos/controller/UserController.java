package com.aloha.magicpos.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.aloha.magicpos.domain.Auths;
import com.aloha.magicpos.domain.Pagination;
import com.aloha.magicpos.domain.Users;
import com.aloha.magicpos.service.AuthService;
import com.aloha.magicpos.service.LogService;
import com.aloha.magicpos.service.SeatReservationService;
import com.aloha.magicpos.service.UserService;
import com.aloha.magicpos.service.UserTicketService;
import com.aloha.magicpos.util.PasswordUtil;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestBody;



@Slf4j
@Controller
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired 
    private UserTicketService userTicketService;

    @Autowired
    private SeatReservationService seatReservationService;

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private LogService logService;

    // ✅ 전체 회원 목록
    @GetMapping("/admin/userlist")
    public String list(
        @RequestParam(value = "type", required = false) String type, 
        @RequestParam(value = "keyword", required = false) String keyword, 
        @ModelAttribute("savedUser") Users savedUser,
        @RequestParam(name = "page", defaultValue = "1") int page,
        @RequestParam(name = "size", defaultValue = "10") int size,
        Model model
        ) throws Exception {

        // 전체 회원 수 
        int total = userService.countUsers(type, keyword);

        // 페이지 네이션 객체 생성 
        Pagination pagination = new Pagination(page, size, 10, total);

        // 사용자 목록 조회 
        List<Users> userList = userService.searchUsers(type, keyword, (page - 1) * size, size);
        
        // 🔥 사용자별 사용시간/남은시간 계산
        for (Users user : userList) {
            Long remain = userTicketService.getTotalRemainTime(user.getNo());
            Long used = seatReservationService.getTotalUsedTime(user.getNo());

            user.setRemainMin(remain);  
            user.setUsedMin(used);      
        }

        model.addAttribute("users", userList);
        model.addAttribute("pagination", pagination);
        model.addAttribute("type", type);
        model.addAttribute("keyword", keyword);

        return "pages/admin/admin_user_list";
    }

    // 회원가입( 사용자 용 )
    @GetMapping("/new")
    public String signupform(Model model) {
        model.addAttribute("user", new Users());
        return "pages/user_signup";
    }

    // 회원가입 처리( 사용자 용 )
    @PostMapping("/signup")
    public String signup(@ModelAttribute Users user, HttpSession session) throws Exception {         // @ModelAttribute Users user : html form 에서 입력한 내용을 Users 객체에 자동으로 담아줌 
        log.info("회원 가입 요청: {}", user);
        
        // 1. 비밀번호 암호화 (서비스에서만 진행)
        // String encodedPassword = passwordEncoder.encode(user.getPassword());
        // user.setPassword(encodedPassword);

        // 2. 회원 정보 저장 
        Users savedUser = userService.insertByUser(user);

        // 3. 권한 부여 
        Auths auth = new Auths();
        auth.setUNo(savedUser.getNo());
        auth.setAuth("ROLE_USER");

        try {
            boolean result = authService.insert(auth);
            log.info("✅ 권한 저장 여부: {}", result);
        } catch (Exception e) {
            log.error("❌ 권한 저장 중 예외 발생: ", e);
        }
        log.info("👉 사용자 번호: {}", savedUser.getNo());

        log.info("✅ 회원가입 끝났고, /login으로 리다이렉트 예정");

        // ✅ 로그 추가
        String username = (user != null) ? user.getUsername() : "알 수 없음";

        String description = username + "님이 " +  "회원 가입 하였습니다.";
        logService.insertLogNoSeatId(user.getNo(), "회원가입", description);

        // 4. 리다이렉트 
        return "redirect:/login";
    }
    

    // 아이디 중복 체크 
    @GetMapping("/admin/check-id")
    @ResponseBody                           // 컨트롤러 메소드의 반환값을 HTTP응답 body로 직접 전송 한다는 의미(뷰 이름 X)
    public Map<String, Boolean> getMethodName(@RequestParam("id") String id) {
        boolean exists = userService.isIdExist(id);
        return Collections.singletonMap("exists", exists);          // key, value 가 1쌍인 map
    }
    
    // 회원 등록 처리
    @PostMapping("/admin/save")
    public String insert(Users user, 
                        RedirectAttributes redirectAttributes             
    ) throws Exception {
        // 임시비밀번호 생성 + 저장된 사용자 정보 반환
        Users savedUser = userService.insert(user);

        // 기본 권한 부여 (예: ROLE_USER)
        Auths auth = new Auths();
        auth.setUNo(user.getNo());
        auth.setAuth("ROLE_USER");
        authService.insert(auth);

        // FlashAttributes로 임시 비번과 플래그 전달 
        redirectAttributes.addFlashAttribute("modalTitle", "회원 등록 완료");
        redirectAttributes.addFlashAttribute("savedUser", savedUser);
        redirectAttributes.addFlashAttribute("showSuccessModal", true);
        
        return "redirect:/users/admin/userlist";
    }

    // ✅ 회원 수정 폼
    @GetMapping("/admin/{userNo}/info")
    @ResponseBody
    public Map<String, Object> getUserInfo(@PathVariable("userNo") Long userNo) throws Exception {
        System.out.println("userNo: " + userNo);

        Users user = userService.findByNo(userNo);
        System.out.println("user : " + user);
        Long remainTime = userTicketService.getTotalRemainTime(userNo);
        Long usedTime = seatReservationService.getTotalUsedTime(userNo);

        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("remainTime", remainTime);
        result.put("usedTime", usedTime);

        return result;      // json응답

    }

    // ✅ 회원 수정 처리
    @PostMapping("/admin/update")
    public String update(Users user, RedirectAttributes redirectAttributes) throws Exception {
        
        userService.update(user);
        // 수정 성공 메시지 flash로 전달
        redirectAttributes.addFlashAttribute("updateSuccess", true);
        return "redirect:/users/admin/userlist";
    }

    // 단건 회원 삭제
    @PostMapping("/admin/{no}/delete")
    @ResponseBody
    public ResponseEntity<String> delete(@PathVariable("no") Long no) throws Exception {
        userService.delete(no);
        return ResponseEntity.ok("ok");
    }

    // 체크된 회원 모두 삭제 
    @PostMapping("/admin/deleteAll")
    @ResponseBody
    public ResponseEntity<String> deleteAll(@RequestParam("userNos") List<Long> userNos) throws Exception {
        for (Long no : userNos) {
            userService.delete(no);
        }
        return ResponseEntity.ok("ok");
    }

    // 비밀번호 초기화 (관리자용)
    @PostMapping("/admin/{no}/reset")
    @ResponseBody
    public Map<String, Object> resetPassword(@PathVariable("no") Long no,
                            RedirectAttributes redirectAttributes) throws Exception {

    Map<String, Object> result = new HashMap<>();

    // 1. 임시 비밀번호 생성 (보안 위해 무작위로)
    String tempPassword = PasswordUtil.generateTempPassword(); 
    String encodedPassword = passwordEncoder.encode(tempPassword);


    // 2. 비밀번호 업데이트 
    boolean updated = userService.resetPassword(no, encodedPassword);

    if (updated) {
        Users user = userService.findByNo(no);  // 사용자 정보 다시 조회
        result.put("success", true);
        result.put("tempPassword", tempPassword);
        result.put("username",user.getUsername());
    } else {
        result.put("success", false);
        result.put("message", "비밀번호 초기화에 실패했습니다. ");
    }

    return result;
}

    // ✅ 회원 검색
    @GetMapping("/search")
    public String search(@RequestParam("keyword") String keyword, Model model) throws Exception {
        List<Users> users = userService.searchUsersByKeyword(keyword);
        model.addAttribute("users", users);
        return "user/list";
    }
}
