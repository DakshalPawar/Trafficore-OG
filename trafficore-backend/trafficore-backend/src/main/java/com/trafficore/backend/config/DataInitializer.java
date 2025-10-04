package com.trafficore.backend.config;

import com.trafficore.backend.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;

    public DataInitializer(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(String... args) throws Exception {
        // create demo users only if not exists
        userService.createUser("kanak", "password123", "DOCTOR");
        userService.createUser("admin", "admin123", "ADMIN");
    }
}

