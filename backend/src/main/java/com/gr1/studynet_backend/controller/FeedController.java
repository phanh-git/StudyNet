package com.gr1.studynet_backend.controller;

import com.gr1.studynet_backend.dto.FeedPostResponse;
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
import com.gr1.studynet_backend.service.FeedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
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
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) Long currentUserId
    ) {
        return feedService.getFeed(subjectId, keyword, type, sortBy, currentUserId);
    }

    @PostMapping("/feed")
    public FeedPostResponse createPost(@Valid @RequestBody CreatePostRequest request) {
        return feedService.createPost(request);
    }

    @GetMapping("/users/{userId}/groups")
    public List<GroupResponse> getUserGroups(@PathVariable Long userId) {
        return feedService.getUserGroups(userId);
    }

    @GetMapping("/users/{userId}/notifications/unread-count")
    public NotificationSummaryResponse getUnreadNotifications(@PathVariable Long userId) {
        return new NotificationSummaryResponse(feedService.getUnreadNotificationCount(userId));
    }

    @GetMapping("/users/{userId}/notifications")
    public List<NotificationResponse> getNotifications(@PathVariable Long userId) {
        return feedService.getNotifications(userId);
    }

    @PatchMapping("/users/{userId}/notifications/{notificationId}/read")
    public void markNotificationAsRead(@PathVariable Long userId, @PathVariable Long notificationId) {
        feedService.markNotificationAsRead(userId, notificationId);
    }

    @GetMapping("/groups")
    public List<GroupResponse> getGroups(
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) Long subjectId,
        @RequestParam(required = false) String keyword
    ) {
        return feedService.getAllGroups(userId, subjectId, keyword);
    }

    @PostMapping("/groups")
    public GroupResponse createGroup(@Valid @RequestBody CreateGroupRequest request) {
        return feedService.createGroup(request);
    }

    @PostMapping("/groups/{groupId}/join")
    public GroupResponse joinGroup(@PathVariable Long groupId, @RequestParam Long userId) {
        return feedService.joinGroup(groupId, userId);
    }

    @GetMapping("/users/{userId}/posts")
    public List<FeedPostResponse> getUserPosts(@PathVariable Long userId) {
        return feedService.getPostsByUser(userId);
    }

    @PostMapping("/posts/{postId}/reactions")
    public ReactionSummaryResponse reactToPost(@PathVariable Long postId, @Valid @RequestBody ReactionRequest request) {
        return feedService.reactToPost(postId, request);
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> getComments(@PathVariable Long postId) {
        return feedService.getCommentsByPost(postId);
    }

    @PostMapping("/posts/{postId}/comments")
    public CommentResponse addComment(@PathVariable Long postId, @Valid @RequestBody CommentRequest request) {
        return feedService.addComment(postId, request);
    }
}
