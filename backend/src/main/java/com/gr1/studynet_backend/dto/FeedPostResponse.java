package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class FeedPostResponse {
    private Long id;
    private Long authorId;
    private String content;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private String type;
    private LocalDateTime createdAt;
    private String authorName;
    private String authorEmail;
    private String authorSchool;
    private boolean shared;
    private Long sharedPostId;
    private Long sharedAuthorId;
    private String sharedAuthorName;
    private String groupName;
    private String subjectName;
    private long reactionCount;
    private long commentCount;
    private long shareCount;
    private boolean currentUserShared;
    private String currentUserReaction;
    private FeedPostResponse sharedPostPreview;
}
