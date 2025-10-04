package com.trafficore.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.trafficore.backend.dto.LoginRequest;
import com.trafficore.backend.dto.LoginResponse;
import com.trafficore.backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        boolean isValid = userService.validateUser(request.getUsername(), request.getPassword());

        if (isValid) {
            return new LoginResponse("✅ Login successful! Welcome " + request.getUsername());
        } else {
            return new LoginResponse("❌ Invalid username or password.");
        }
    }
}



