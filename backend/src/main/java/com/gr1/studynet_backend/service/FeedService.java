package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.dto.CreateGroupRequest;
import com.gr1.studynet_backend.dto.CreatePostRequest;
import com.gr1.studynet_backend.dto.CommentRequest;
import com.gr1.studynet_backend.dto.CommentResponse;
import com.gr1.studynet_backend.dto.FeedPostResponse;
import com.gr1.studynet_backend.dto.GroupResponse;
import com.gr1.studynet_backend.dto.NotificationResponse;
import com.gr1.studynet_backend.dto.ReactionRequest;
import com.gr1.studynet_backend.dto.ReactionSummaryResponse;
import com.gr1.studynet_backend.model.Comment;
import com.gr1.studynet_backend.model.Group;
import com.gr1.studynet_backend.model.GroupMember;
import com.gr1.studynet_backend.model.Notification;
import com.gr1.studynet_backend.model.Post;
import com.gr1.studynet_backend.model.Reaction;
import com.gr1.studynet_backend.model.Subject;
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
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class FeedService {
    private final SubjectRepository subjectRepository;
    private final PostRepository postRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;
    private final NotificationRepository notificationRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public List<Subject> getSubjects() {
        return subjectRepository.findAll();
    }

    public List<FeedPostResponse> getFeed(Long subjectId, String keyword, String type, String sortBy, Long currentUserId) {
        String normalizedType = normalizeNullable(type);
        String normalizedKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

        List<Post> posts = postRepository.findFilteredPublicPosts(subjectId, normalizedType);

        List<FeedPostResponse> mappedPosts = posts.stream()
            .filter(post -> normalizedKeyword.isBlank() || matchesKeyword(post, normalizedKeyword))
            .map(post -> mapPost(post, currentUserId))
            .toList();

        if ("TRENDING".equalsIgnoreCase(sortBy)) {
            return mappedPosts.stream()
                .sorted(Comparator.comparingLong((FeedPostResponse post) -> post.getReactionCount() + post.getCommentCount()).reversed())
                .toList();
        }

        return mappedPosts;
    }

    public List<GroupResponse> getUserGroups(Long userId) {
        return groupMemberRepository.findByUserId(userId).stream()
            .map(member -> mapGroup(member.getGroup(), userId, member.getRole()))
            .toList();
    }

    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    public List<GroupResponse> getAllGroups(Long userId, Long subjectId, String keyword) {
        List<Group> groups = subjectId != null
            ? groupRepository.findBySubjectId(subjectId)
            : groupRepository.findAll();

        String normalizedKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

        return groups.stream()
            .filter(group -> normalizedKeyword.isBlank()
                || contains(group.getName(), normalizedKeyword)
                || contains(group.getDescription(), normalizedKeyword)
                || (group.getSubject() != null && contains(group.getSubject().getName(), normalizedKeyword)))
            .map(group -> mapGroup(group, userId, null))
            .toList();
    }

    public GroupResponse createGroup(CreateGroupRequest request) {
        User creator = userRepository.findById(request.getCreatorId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người tạo nhóm."));
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy môn học."));

        Group group = new Group();
        group.setName(request.getName().trim());
        group.setDescription(request.getDescription().trim());
        group.setStatus(request.getStatus().trim().toUpperCase(Locale.ROOT));
        group.setCreator(creator);
        group.setSubject(subject);

        Group savedGroup = groupRepository.save(group);

        GroupMember member = new GroupMember();
        member.setGroup(savedGroup);
        member.setUser(creator);
        member.setRole("GROUP_ADMIN");
        groupMemberRepository.save(member);

        return mapGroup(savedGroup, creator.getId(), "GROUP_ADMIN");
    }

    public GroupResponse joinGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm."));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        GroupMember existing = groupMemberRepository.findByUserIdAndGroupId(userId, groupId).orElse(null);
        if (existing == null) {
            GroupMember member = new GroupMember();
            member.setGroup(group);
            member.setUser(user);
            member.setRole("MEMBER");
            groupMemberRepository.save(member);
        }

        return mapGroup(group, userId, "MEMBER");
    }

    public FeedPostResponse createPost(CreatePostRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        Post post = new Post();
        post.setContent(request.getContent().trim());
        post.setFileUrl(request.getFileUrl());
        post.setType(request.getType().trim().toUpperCase(Locale.ROOT));
        post.setUser(user);

        if (request.getGroupId() != null) {
            Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm."));
            post.setGroup(group);
            if (request.getSubjectId() == null && group.getSubject() != null) {
                post.setSubject(group.getSubject());
            }
        }

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy môn học."));
            post.setSubject(subject);
        }

        Post savedPost = postRepository.save(post);
        return mapPost(savedPost, user.getId());
    }

    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId).stream()
            .map(notification -> new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getSender() != null ? notification.getSender().getFullName() : null,
                notification.getTargetUrl(),
                notification.getIsRead(),
                notification.getCreatedAt()
            ))
            .toList();
    }

    public void markNotificationAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndReceiverId(notificationId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông báo."));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public List<FeedPostResponse> getPostsByUser(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(post -> mapPost(post, userId))
            .toList();
    }

    public ReactionSummaryResponse reactToPost(Long postId, ReactionRequest request) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết."));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        String normalizedType = request.getType().trim().toUpperCase(Locale.ROOT);
        Reaction existing = reactionRepository.findByPostIdAndUserId(postId, user.getId()).orElse(null);

        if (existing != null && normalizedType.equals(existing.getType())) {
            reactionRepository.delete(existing);
        } else if (existing != null) {
            existing.setType(normalizedType);
            reactionRepository.save(existing);
        } else {
            Reaction reaction = new Reaction();
            reaction.setPost(post);
            reaction.setUser(user);
            reaction.setType(normalizedType);
            reactionRepository.save(reaction);
        }

        return new ReactionSummaryResponse(
            reactionRepository.countByPostId(postId),
            reactionRepository.findByPostIdAndUserId(postId, user.getId()).map(Reaction::getType).orElse(null)
        );
    }

    public List<CommentResponse> getCommentsByPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
            .map(comment -> new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getFullName(),
                comment.getUser().getSchool(),
                comment.getCreatedAt()
            ))
            .toList();
    }

    public CommentResponse addComment(Long postId, CommentRequest request) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết."));
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(request.getContent().trim());

        Comment savedComment = commentRepository.save(comment);

        return new CommentResponse(
            savedComment.getId(),
            savedComment.getContent(),
            savedComment.getUser().getFullName(),
            savedComment.getUser().getSchool(),
            savedComment.getCreatedAt()
        );
    }

    private boolean matchesKeyword(Post post, String keyword) {
        return contains(post.getContent(), keyword)
            || contains(post.getUser().getFullName(), keyword)
            || (post.getGroup() != null && contains(post.getGroup().getName(), keyword))
            || (post.getSubject() != null && contains(post.getSubject().getName(), keyword));
    }

    private boolean contains(String source, String keyword) {
        return source != null && source.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank() || "ALL".equalsIgnoreCase(value)) {
            return null;
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private GroupResponse mapGroup(Group group, Long userId, String fallbackRole) {
        GroupMember membership = userId != null
            ? groupMemberRepository.findByUserIdAndGroupId(userId, group.getId()).orElse(null)
            : null;

        String role = membership != null ? membership.getRole() : fallbackRole;

        return new GroupResponse(
            group.getId(),
            group.getName(),
            group.getDescription(),
            group.getStatus(),
            role,
            group.getSubject() != null ? group.getSubject().getName() : null,
            group.getSubject() != null ? group.getSubject().getId() : null,
            groupMemberRepository.countByGroupId(group.getId()),
            postRepository.countByGroupId(group.getId()),
            membership != null
        );
    }

    private FeedPostResponse mapPost(Post post, Long currentUserId) {
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
            .currentUserReaction(currentUserId != null
                ? reactionRepository.findByPostIdAndUserId(post.getId(), currentUserId).map(Reaction::getType).orElse(null)
                : null)
            .build();
    }
}
