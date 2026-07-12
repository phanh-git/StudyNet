package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.dto.AuthResponse;
import com.gr1.studynet_backend.dto.LoginRequest;
import com.gr1.studynet_backend.dto.RegisterRequest;
import com.gr1.studynet_backend.dto.UserResponse;
import com.gr1.studynet_backend.model.User;
import com.gr1.studynet_backend.repository.UserRepository;
import com.gr1.studynet_backend.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email đã tồn tại.");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setSchool(request.getSchool().trim());
        user.setMajor(request.getMajor().trim());
        user.setInterestedSubjects(serializeInterestedSubjects(request.getInterestedSubjects()));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        User savedUser = userRepository.save(user);
        return new AuthResponse("Đăng ký thành công.", mapUser(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
            .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không đúng."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Email hoặc mật khẩu không đúng.");
        }

        return new AuthResponse("Đăng nhập thành công.", mapUser(user));
    }

    public UserResponse getCurrentUser(AuthenticatedUser authenticatedUser) {
        return mapUser(
            authenticatedUser.getId(),
            authenticatedUser.getFullName(),
            authenticatedUser.getEmail(),
            authenticatedUser.getSchool(),
            authenticatedUser.getMajor(),
            authenticatedUser.getInterestedSubjects(),
            authenticatedUser.getRole()
        );
    }

    private UserResponse mapUser(User user) {
        return mapUser(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getSchool(),
            user.getMajor(),
            user.getInterestedSubjects(),
            user.getRole()
        );
    }

    private UserResponse mapUser(Long id, String fullName, String email, String school, String major, String interestedSubjects, String role) {
        return new UserResponse(
            id,
            fullName,
            email,
            school,
            major,
            deserializeInterestedSubjects(interestedSubjects),
            role
        );
    }

    private String serializeInterestedSubjects(List<String> subjects) {
        if (subjects == null || subjects.isEmpty()) {
            return null;
        }

        return subjects.stream()
            .filter(subject -> subject != null && !subject.isBlank())
            .map(String::trim)
            .distinct()
            .reduce((left, right) -> left + "||" + right)
            .orElse(null);
    }

    private List<String> deserializeInterestedSubjects(String subjects) {
        if (subjects == null || subjects.isBlank()) {
            return List.of();
        }

        return List.of(subjects.split("\\|\\|")).stream()
            .map(String::trim)
            .filter(subject -> !subject.isBlank())
            .toList();
    }
}
