package com.gr1.studynet_backend.controller;

import com.gr1.studynet_backend.dto.FeedPostResponse;
import com.gr1.studynet_backend.dto.GroupDetailResponse;
import com.gr1.studynet_backend.dto.GroupPageResponse;
import com.gr1.studynet_backend.dto.GroupResponse;
import com.gr1.studynet_backend.dto.NotificationSummaryResponse;
import com.gr1.studynet_backend.dto.CreateGroupRequest;
import com.gr1.studynet_backend.dto.CreatePostRequest;
import com.gr1.studynet_backend.dto.CommentRequest;
import com.gr1.studynet_backend.dto.CommentResponse;
import com.gr1.studynet_backend.dto.NotificationResponse;
import com.gr1.studynet_backend.model.Subject;
import com.gr1.studynet_backend.dto.ReactionRequest;
import com.gr1.studynet_backend.dto.ReactionSummaryResponse;
import com.gr1.studynet_backend.dto.RejectGroupMemberRequest;
import com.gr1.studynet_backend.dto.UpdatePostRequest;
import com.gr1.studynet_backend.service.FeedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeedController {
    private final FeedService feedService;

    @GetMapping("/subjects")
    public List<Subject> getSubjects() {
        return feedService.getSubjects();
    }

    @GetMapping("/feed")
    public List<FeedPostResponse> getFeed(
        @RequestParam(required = false) Long subjectId,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String sortBy
    ) {
        return feedService.getFeed(subjectId, keyword, type, sortBy);
    }

    @PostMapping("/feed")
    public FeedPostResponse createPost(@Valid @RequestBody CreatePostRequest request) {
        return feedService.createPost(request);
    }

    @GetMapping("/users/me/groups")
    public List<GroupResponse> getUserGroups() {
        return feedService.getUserGroups();
    }

    @GetMapping("/users/me/notifications/unread-count")
    public NotificationSummaryResponse getUnreadNotifications() {
        return new NotificationSummaryResponse(feedService.getUnreadNotificationCount());
    }

    @GetMapping("/users/me/notifications")
    public List<NotificationResponse> getNotifications() {
        return feedService.getNotifications();
    }

    @PatchMapping("/users/me/notifications/{notificationId}/read")
    public void markNotificationAsRead(@PathVariable Long notificationId) {
        feedService.markNotificationAsRead(notificationId);
    }

    @GetMapping("/groups")
    public GroupPageResponse getGroups(
        @RequestParam(required = false) Long subjectId,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "6") int size
    ) {
        return feedService.getAllGroups(subjectId, keyword, page, size);
    }

    @PostMapping("/groups")
    public GroupResponse createGroup(@Valid @RequestBody CreateGroupRequest request) {
        return feedService.createGroup(request);
    }

    @GetMapping("/groups/{groupId}")
    public GroupDetailResponse getGroupDetail(@PathVariable Long groupId) {
        return feedService.getGroupDetail(groupId);
    }

    @PostMapping("/groups/{groupId}/join")
    public GroupResponse joinGroup(@PathVariable Long groupId) {
        return feedService.joinGroup(groupId);
    }

    @DeleteMapping("/groups/{groupId}/join")
    public GroupResponse cancelJoinRequest(@PathVariable Long groupId) {
        return feedService.cancelJoinRequest(groupId);
    }

    @PatchMapping("/groups/{groupId}/members/{targetUserId}/approve")
    public void approveGroupMember(
        @PathVariable Long groupId,
        @PathVariable Long targetUserId
    ) {
        feedService.approveGroupMember(groupId, targetUserId);
    }

    @PatchMapping("/groups/{groupId}/members/{targetUserId}/reject")
    public void rejectGroupMember(
        @PathVariable Long groupId,
        @PathVariable Long targetUserId,
        @Valid @RequestBody RejectGroupMemberRequest request
    ) {
        feedService.rejectGroupMember(groupId, targetUserId, request.getReason());
    }

    @DeleteMapping("/groups/{groupId}/members")
    public void leaveGroup(@PathVariable Long groupId) {
        feedService.leaveGroup(groupId);
    }

    @DeleteMapping("/groups/{groupId}")
    public void deleteGroup(@PathVariable Long groupId) {
        feedService.deleteGroup(groupId);
    }

    @GetMapping("/users/{userId}/posts")
    public List<FeedPostResponse> getUserPosts(
        @PathVariable Long userId
    ) {
        return feedService.getPostsByUser(userId);
    }

    @PostMapping("/posts/{postId}/reactions")
    public ReactionSummaryResponse reactToPost(@PathVariable Long postId, @Valid @RequestBody ReactionRequest request) {
        return feedService.reactToPost(postId, request);
    }

    @PatchMapping("/posts/{postId}")
    public FeedPostResponse updatePost(@PathVariable Long postId, @Valid @RequestBody UpdatePostRequest request) {
        return feedService.updatePost(postId, request);
    }

    @DeleteMapping("/posts/{postId}")
    public void deletePost(@PathVariable Long postId) {
        feedService.deletePost(postId);
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> getComments(@PathVariable Long postId) {
        return feedService.getCommentsByPost(postId);
    }

    @PostMapping("/posts/{postId}/comments")
    public CommentResponse addComment(@PathVariable Long postId, @Valid @RequestBody CommentRequest request) {
        return feedService.addComment(postId, request);
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public void deleteComment(
        @PathVariable Long postId,
        @PathVariable Long commentId
    ) {
        feedService.deleteComment(postId, commentId);
    }
}
