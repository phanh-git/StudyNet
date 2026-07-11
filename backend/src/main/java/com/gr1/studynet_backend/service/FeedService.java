package com.gr1.studynet_backend.service;

import com.gr1.studynet_backend.dto.CreateGroupRequest;
import com.gr1.studynet_backend.dto.CreatePostRequest;
import com.gr1.studynet_backend.dto.CommentRequest;
import com.gr1.studynet_backend.dto.CommentResponse;
import com.gr1.studynet_backend.dto.FeedPostResponse;
import com.gr1.studynet_backend.dto.GroupDetailResponse;
import com.gr1.studynet_backend.dto.GroupMemberResponse;
import com.gr1.studynet_backend.dto.GroupPageResponse;
import com.gr1.studynet_backend.dto.GroupResponse;
import com.gr1.studynet_backend.dto.NotificationResponse;
import com.gr1.studynet_backend.dto.ReactionRequest;
import com.gr1.studynet_backend.dto.ReactionSummaryResponse;
import com.gr1.studynet_backend.dto.UpdatePostRequest;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FeedService {
    private static final Set<String> IMPORTANT_NOTIFICATION_TYPES = Set.of(
        "GROUP_REQUEST",
        "GROUP_REQUEST_APPROVED",
        "GROUP_REQUEST_REJECTED"
    );

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
        if (currentUserId == null) {
            return List.of();
        }

        String normalizedType = normalizeNullable(type);
        String normalizedKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

        List<Post> posts = postRepository.findFeedPostsForUser(currentUserId, subjectId, normalizedType);

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
        return groupMemberRepository.findByUserIdAndMembershipStatus(userId, "APPROVED").stream()
            .map(member -> mapGroup(member.getGroup(), userId, member.getRole()))
            .toList();
    }

    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId).stream()
            .filter(notification -> !Boolean.TRUE.equals(notification.getIsRead()))
            .filter(notification -> IMPORTANT_NOTIFICATION_TYPES.contains(notification.getType()))
            .count();
    }

    public GroupPageResponse getAllGroups(Long userId, Long subjectId, String keyword, int page, int size) {
        List<Group> groups = subjectId != null
            ? groupRepository.findBySubjectId(subjectId)
            : groupRepository.findAll();

        String normalizedKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

        List<GroupResponse> filteredGroups = groups.stream()
            .filter(group -> normalizedKeyword.isBlank()
                || contains(group.getName(), normalizedKeyword)
                || contains(group.getDescription(), normalizedKeyword)
                || (group.getSubject() != null && contains(group.getSubject().getName(), normalizedKeyword)))
            .map(group -> mapGroup(group, userId, null))
            .toList();

        int safeSize = Math.max(1, size);
        int safePage = Math.max(1, page);
        int totalItems = filteredGroups.size();
        int totalPages = Math.max(1, (int) Math.ceil((double) totalItems / safeSize));
        int boundedPage = Math.min(safePage, totalPages);
        int fromIndex = Math.min((boundedPage - 1) * safeSize, totalItems);
        int toIndex = Math.min(fromIndex + safeSize, totalItems);
        long joinedCount = filteredGroups.stream().filter(GroupResponse::isJoined).count();

        return new GroupPageResponse(
            filteredGroups.subList(fromIndex, toIndex),
            boundedPage,
            safeSize,
            totalPages,
            totalItems,
            joinedCount
        );
    }

    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request) {
        User creator = userRepository.findById(request.getCreatorId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người tạo nhóm."));
        Subject subject = resolveSubject(request.getSubjectId(), request.getCustomSubjectName());

        Group group = new Group();
        group.setName(request.getName().trim());
        group.setDescription(request.getDescription().trim());
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

    @Transactional
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
            member.setMembershipStatus("PENDING");
            groupMemberRepository.save(member);
            notifyGroupAdminsAboutJoinRequest(group, user);
        }

        return mapGroup(group, userId, existing != null ? existing.getRole() : "MEMBER");
    }

    @Transactional
    public void leaveGroup(Long groupId, Long userId) {
        GroupMember membership = groupMemberRepository.findByUserIdAndGroupId(userId, groupId)
            .orElseThrow(() -> new IllegalArgumentException("Bạn chưa tham gia nhóm này."));

        if ("GROUP_ADMIN".equalsIgnoreCase(membership.getRole())) {
            throw new IllegalArgumentException("Trưởng nhóm không thể rời nhóm. Hãy xóa nhóm nếu bạn muốn kết thúc nhóm này.");
        }

        groupMemberRepository.delete(membership);
    }

    @Transactional
    public void deleteGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm."));
        GroupMember membership = groupMemberRepository.findByUserIdAndGroupId(userId, groupId)
            .orElseThrow(() -> new IllegalArgumentException("Bạn không có quyền xóa nhóm này."));

        if (!"GROUP_ADMIN".equalsIgnoreCase(membership.getRole())) {
            throw new IllegalArgumentException("Chỉ admin nhóm mới có thể xóa nhóm.");
        }

        List<Long> postIds = postRepository.findByGroupId(groupId).stream()
            .map(Post::getId)
            .toList();

        if (!postIds.isEmpty()) {
            reactionRepository.deleteByPostIdIn(postIds);
            commentRepository.deleteByPostIdIn(postIds);
            postRepository.deleteByGroupId(groupId);
        }

        groupMemberRepository.deleteByGroupId(groupId);
        groupRepository.delete(group);
    }

    public GroupDetailResponse getGroupDetail(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm."));

        List<GroupMemberResponse> members = groupMemberRepository.findByGroupIdAndMembershipStatus(groupId, "APPROVED").stream()
            .map(member -> new GroupMemberResponse(
                member.getUser().getId(),
                member.getUser().getFullName(),
                member.getUser().getSchool(),
                member.getRole(),
                member.getMembershipStatus()
            ))
            .toList();

        List<GroupMemberResponse> pendingMembers = groupMemberRepository.findByGroupIdAndMembershipStatus(groupId, "PENDING").stream()
            .map(member -> new GroupMemberResponse(
                member.getUser().getId(),
                member.getUser().getFullName(),
                member.getUser().getSchool(),
                member.getRole(),
                member.getMembershipStatus()
            ))
            .toList();

        List<FeedPostResponse> posts = postRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
            .map(post -> mapPost(post, userId))
            .toList();

        return new GroupDetailResponse(
            mapGroup(group, userId, null),
            members,
            pendingMembers,
            posts
        );
    }

    @Transactional
    public void approveGroupMember(Long groupId, Long adminUserId, Long targetUserId) {
        GroupMember adminMembership = groupMemberRepository.findByUserIdAndGroupId(adminUserId, groupId)
            .orElseThrow(() -> new IllegalArgumentException("Bạn không có quyền duyệt thành viên nhóm này."));
        if (!"GROUP_ADMIN".equalsIgnoreCase(adminMembership.getRole())) {
            throw new IllegalArgumentException("Chỉ admin nhóm mới có thể duyệt thành viên.");
        }

        GroupMember pendingMembership = groupMemberRepository.findByUserIdAndGroupId(targetUserId, groupId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu tham gia nhóm."));
        if (!"PENDING".equalsIgnoreCase(pendingMembership.getMembershipStatus())) {
            throw new IllegalArgumentException("Yêu cầu này không còn ở trạng thái chờ duyệt.");
        }

        pendingMembership.setMembershipStatus("APPROVED");
        pendingMembership.setRole("MEMBER");
        groupMemberRepository.save(pendingMembership);

        Notification notification = createNotification(
            pendingMembership.getUser(),
            adminMembership.getUser(),
            "GROUP_REQUEST_APPROVED",
            "Yêu cầu tham gia nhóm " + pendingMembership.getGroup().getName() + " của bạn đã được duyệt."
        );
        notificationRepository.save(notification);
    }

    @Transactional
    public void rejectGroupMember(Long groupId, Long adminUserId, Long targetUserId, String reason) {
        GroupMember adminMembership = groupMemberRepository.findByUserIdAndGroupId(adminUserId, groupId)
            .orElseThrow(() -> new IllegalArgumentException("Bạn không có quyền từ chối thành viên nhóm này."));
        if (!"GROUP_ADMIN".equalsIgnoreCase(adminMembership.getRole())) {
            throw new IllegalArgumentException("Chỉ admin nhóm mới có thể từ chối thành viên.");
        }

        GroupMember pendingMembership = groupMemberRepository.findByUserIdAndGroupId(targetUserId, groupId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu tham gia nhóm."));
        if (!"PENDING".equalsIgnoreCase(pendingMembership.getMembershipStatus())) {
            throw new IllegalArgumentException("Yêu cầu này không còn ở trạng thái chờ duyệt.");
        }

        Notification notification = createNotification(
            pendingMembership.getUser(),
            adminMembership.getUser(),
            "GROUP_REQUEST_REJECTED",
            "Yêu cầu tham gia nhóm " + pendingMembership.getGroup().getName() + " của bạn đã bị từ chối. Lý do: " + reason.trim()
        );
        notificationRepository.save(notification);
        groupMemberRepository.delete(pendingMembership);
    }

    @Transactional
    public FeedPostResponse createPost(CreatePostRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        boolean hasContent = request.getContent() != null && !request.getContent().trim().isBlank();
        boolean hasAttachment = request.getFileUrl() != null && !request.getFileUrl().trim().isBlank();
        if (!hasContent && !hasAttachment) {
            throw new IllegalArgumentException("Bài viết cần có nội dung hoặc ít nhất một tệp đính kèm.");
        }

        Post post = new Post();
        post.setContent(hasContent ? request.getContent().trim() : null);
        post.setFileUrl(request.getFileUrl());
        post.setFileName(request.getFileName());
        post.setFileType(request.getFileType());
        post.setType(request.getType().trim().toUpperCase(Locale.ROOT));
        post.setUser(user);

        if (request.getGroupId() != null) {
            Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm."));
            GroupMember membership = groupMemberRepository.findByUserIdAndGroupId(user.getId(), group.getId()).orElse(null);
            if (membership == null || !"APPROVED".equalsIgnoreCase(membership.getMembershipStatus())) {
                throw new IllegalArgumentException("Bạn cần là thành viên của nhóm để đăng bài.");
            }
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

    @Transactional
    public FeedPostResponse updatePost(Long postId, UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết."));

        if (!post.getUser().getId().equals(request.getUserId())) {
            throw new IllegalArgumentException("Chỉ người đăng mới có thể chỉnh sửa bài viết này.");
        }

        boolean hasContent = request.getContent() != null && !request.getContent().trim().isBlank();
        boolean hasAttachment = request.getFileUrl() != null && !request.getFileUrl().trim().isBlank();
        if (!hasContent && !hasAttachment) {
            throw new IllegalArgumentException("Bài viết cần có nội dung hoặc ít nhất một tệp đính kèm.");
        }

        post.setContent(hasContent ? request.getContent().trim() : null);
        post.setFileUrl(hasAttachment ? request.getFileUrl() : null);
        post.setFileName(hasAttachment ? request.getFileName() : null);
        post.setFileType(hasAttachment ? request.getFileType() : null);
        post.setType(request.getType().trim().toUpperCase(Locale.ROOT));

        Post savedPost = postRepository.save(post);
        return mapPost(savedPost, request.getUserId());
    }

    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId).stream()
            .filter(notification -> IMPORTANT_NOTIFICATION_TYPES.contains(notification.getType()))
            .map(notification -> new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getSender() != null ? notification.getSender().getFullName() : null,
                notification.getIsRead(),
                notification.getCreatedAt()
            ))
            .toList();
    }

    @Transactional
    public void markNotificationAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndReceiverId(notificationId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông báo."));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public List<FeedPostResponse> getPostsByUser(Long userId, Long currentUserId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(post -> mapPost(post, currentUserId))
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

    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết."));

        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Chỉ người đăng mới có thể xóa bài viết này.");
        }

        reactionRepository.deleteByPostIdIn(List.of(postId));
        commentRepository.deleteByPostIdIn(List.of(postId));
        postRepository.delete(post);
    }

    public List<CommentResponse> getCommentsByPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
            .map(comment -> new CommentResponse(
                comment.getId(),
                comment.getUser().getId(),
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
            savedComment.getUser().getId(),
            savedComment.getContent(),
            savedComment.getUser().getFullName(),
            savedComment.getUser().getSchool(),
            savedComment.getCreatedAt()
        );
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, Long userId) {
        Comment comment = commentRepository.findByIdAndPostId(commentId, postId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bình luận."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Chỉ người viết mới có thể xóa bình luận này.");
        }

        commentRepository.delete(comment);
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

    private void notifyGroupAdminsAboutJoinRequest(Group group, User requester) {
        List<GroupMember> adminMembers = groupMemberRepository.findByGroupIdAndMembershipStatus(group.getId(), "APPROVED").stream()
            .filter(member -> "GROUP_ADMIN".equalsIgnoreCase(member.getRole()))
            .toList();

        if (adminMembers.isEmpty()) {
            return;
        }

        String message = requester.getFullName() + " vừa gửi yêu cầu tham gia nhóm " + group.getName() + ".";

        List<Notification> notifications = adminMembers.stream()
            .map(member -> createNotification(member.getUser(), requester, "GROUP_REQUEST", message))
            .toList();

        notificationRepository.saveAll(notifications);
    }

    private Notification createNotification(User receiver, User sender, String type, String message) {
        Notification notification = new Notification();
        notification.setReceiver(receiver);
        notification.setSender(sender);
        notification.setType(type);
        notification.setMessage(message);
        notification.setIsRead(false);
        return notification;
    }

    private Subject resolveSubject(Long subjectId, String customSubjectName) {
        if (subjectId != null) {
            return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy môn học."));
        }

        if (customSubjectName == null || customSubjectName.isBlank()) {
            throw new IllegalArgumentException("Vui lòng chọn hoặc nhập môn học.");
        }

        String normalizedName = customSubjectName.trim();
        return subjectRepository.findByNameIgnoreCase(normalizedName)
            .orElseGet(() -> subjectRepository.save(createCustomSubject(normalizedName)));
    }

    private Subject createCustomSubject(String subjectName) {
        Subject subject = new Subject();
        subject.setName(subjectName);
        subject.setCode(generateSubjectCode(subjectName));
        return subject;
    }

    private String generateSubjectCode(String subjectName) {
        String normalized = Normalizer.normalize(subjectName, Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "")
            .replaceAll("[^A-Za-z0-9]+", "_")
            .replaceAll("^_+|_+$", "")
            .toUpperCase(Locale.ROOT);

        String baseCode = normalized.isBlank() ? "SUBJECT" : normalized;
        String candidate = baseCode.substring(0, Math.min(baseCode.length(), 60));
        int suffix = 1;

        while (subjectRepository.existsByCodeIgnoreCase(candidate)) {
            String suffixValue = "_" + suffix++;
            int availableLength = Math.max(1, 60 - suffixValue.length());
            candidate = baseCode.substring(0, Math.min(baseCode.length(), availableLength)) + suffixValue;
        }

        return candidate;
    }

    private GroupResponse mapGroup(Group group, Long userId, String fallbackRole) {
        GroupMember membership = userId != null
            ? groupMemberRepository.findByUserIdAndGroupId(userId, group.getId()).orElse(null)
            : null;

        String role = membership != null ? membership.getRole() : fallbackRole;
        boolean joined = membership != null && "APPROVED".equalsIgnoreCase(membership.getMembershipStatus());
        boolean pending = membership != null && "PENDING".equalsIgnoreCase(membership.getMembershipStatus());

        return new GroupResponse(
            group.getId(),
            group.getName(),
            group.getDescription(),
            role,
            group.getSubject() != null ? group.getSubject().getName() : null,
            group.getSubject() != null ? group.getSubject().getId() : null,
            groupMemberRepository.countByGroupIdAndMembershipStatus(group.getId(), "APPROVED"),
            postRepository.countByGroupId(group.getId()),
            joined,
            pending
        );
    }

    private FeedPostResponse mapPost(Post post, Long currentUserId) {
        return FeedPostResponse.builder()
            .id(post.getId())
            .authorId(post.getUser().getId())
            .content(post.getContent())
            .fileUrl(post.getFileUrl())
            .fileName(post.getFileName())
            .fileType(post.getFileType())
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
