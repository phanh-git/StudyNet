package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.dto.UserProfileResponse;
import com.gr1.studynet_backend.model.User;
import com.gr1.studynet_backend.repository.GroupMemberRepository;
import com.gr1.studynet_backend.repository.PostRepository;
import com.gr1.studynet_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
            user.getRole(),
            groupMemberRepository.findByUserId(userId).size(),
            (int) postRepository.countByUserId(userId)
        );
    }
}
