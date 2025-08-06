package com.aloha.magicpos;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.aloha.magicpos.service.SeatService;

import lombok.RequiredArgsConstructor;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalControllerAdvice {
        private final SeatService seatService;

        @ModelAttribute("usingSeatCount")
        public int usingSeatCount() throws Exception {
            return seatService.countUsingSeats();
        }

        @ModelAttribute("totalSeatCount")
        public int totalSeatCount() throws Exception {
            return seatService.countAllSeats();
        }
}
