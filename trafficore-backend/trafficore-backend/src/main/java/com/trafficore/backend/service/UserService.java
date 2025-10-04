package com.trafficore.backend.service;

import com.trafficore.backend.model.User;
import com.trafficore.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean validateUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        return user != null && user.getPassword().equals(password);
    }

    public void createUser(String username, String password, String role) {
        // only create if user doesn’t exist
        if (userRepository.findByUsername(username) == null) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(password);  // ⚠️ later we’ll hash passwords
            user.setRole(role);
            userRepository.save(user);
        }
    }
}
