package com.trafficore.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/api/auth/ping")
    public String ping() {
        return "🚀 Backend is running!";
    }
}

