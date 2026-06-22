package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.dto.UserProfileResponse;
import com.gr1.studynet_backend.model.User;
import com.gr1.studynet_backend.repository.GroupMemberRepository;
import com.gr1.studynet_backend.repository.PostRepository;
import com.gr1.studynet_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final PostRepository postRepository;

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        return new UserProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getSchool(),
            user.getMajor(),
            deserializeInterestedSubjects(user.getInterestedSubjects()),
            user.getRole(),
            groupMemberRepository.findByUserId(userId).size(),
            (int) postRepository.countByUserId(userId)
        );
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
