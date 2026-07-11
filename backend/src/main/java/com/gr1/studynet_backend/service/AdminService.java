package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.dto.AdminGroupRowResponse;
import com.gr1.studynet_backend.dto.AdminOverviewResponse;
import com.gr1.studynet_backend.dto.AdminUserRowResponse;
import com.gr1.studynet_backend.dto.FeedPostResponse;
import com.gr1.studynet_backend.model.Group;
import com.gr1.studynet_backend.model.Reaction;
import com.gr1.studynet_backend.model.User;
import com.gr1.studynet_backend.repository.CommentRepository;
import com.gr1.studynet_backend.repository.GroupMemberRepository;
import com.gr1.studynet_backend.repository.GroupRepository;
import com.gr1.studynet_backend.repository.NotificationRepository;
import com.gr1.studynet_backend.repository.PostRepository;
import com.gr1.studynet_backend.repository.ReactionRepository;
import com.gr1.studynet_backend.repository.SubjectRepository;
import com.gr1.studynet_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final PostRepository postRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationRepository notificationRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;

    public AdminOverviewResponse getOverview() {
        List<User> users = userRepository.findAll();
        List<Group> groups = groupRepository.findAll();

        return new AdminOverviewResponse(
            users.size(),
            users.stream().filter(user -> "ADMIN".equalsIgnoreCase(user.getRole())).count(),
            groups.size(),
            postRepository.count(),
            subjectRepository.count(),
            notificationRepository.count(),
            users.stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::mapUser)
                .toList(),
            groups.stream()
                .sorted(Comparator.comparing(Group::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::mapGroup)
                .toList(),
            postRepository.findAll().stream()
                .sorted(Comparator.comparing(com.gr1.studynet_backend.model.Post::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(this::mapPost)
                .toList()
        );
    }

    public List<AdminUserRowResponse> getUsers() {
        return userRepository.findAll().stream()
            .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::mapUser)
            .toList();
    }

    public List<AdminGroupRowResponse> getGroups() {
        return groupRepository.findAll().stream()
            .sorted(Comparator.comparing(Group::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::mapGroup)
            .toList();
    }

    public List<FeedPostResponse> getPosts() {
        return postRepository.findAll().stream()
            .sorted(Comparator.comparing(com.gr1.studynet_backend.model.Post::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::mapPost)
            .toList();
    }

    private AdminUserRowResponse mapUser(User user) {
        return new AdminUserRowResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getSchool(),
            user.getMajor(),
            user.getRole(),
            deserializeInterestedSubjects(user.getInterestedSubjects()),
            groupMemberRepository.findByUserIdAndMembershipStatus(user.getId(), "APPROVED").size(),
            postRepository.countByUserId(user.getId()),
            user.getCreatedAt()
        );
    }

    private AdminGroupRowResponse mapGroup(Group group) {
        return new AdminGroupRowResponse(
            group.getId(),
            group.getName(),
            group.getSubject() != null ? group.getSubject().getName() : null,
            group.getCreator() != null ? group.getCreator().getFullName() : null,
            groupMemberRepository.countByGroupIdAndMembershipStatus(group.getId(), "APPROVED"),
            postRepository.countByGroupId(group.getId()),
            group.getCreatedAt()
        );
    }

    private FeedPostResponse mapPost(com.gr1.studynet_backend.model.Post post) {
        return FeedPostResponse.builder()
            .id(post.getId())
            .content(post.getContent())
            .fileUrl(post.getFileUrl())
            .type(post.getType())
            .createdAt(post.getCreatedAt())
            .authorName(post.getUser().getFullName())
            .authorEmail(post.getUser().getEmail())
            .authorSchool(post.getUser().getSchool())
            .groupName(post.getGroup() != null ? post.getGroup().getName() : null)
            .subjectName(post.getSubject() != null ? post.getSubject().getName() : null)
            .reactionCount(reactionRepository.countByPostId(post.getId()))
            .commentCount(commentRepository.findByPostIdOrderByCreatedAtAsc(post.getId()).size())
            .currentUserReaction(null)
            .build();
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
