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
    private String content;
    private String fileUrl;
    private String type;
    private LocalDateTime createdAt;
    private String authorName;
    private String authorEmail;
    private String authorSchool;
    private String groupName;
    private String subjectName;
    private long reactionCount;
    private long commentCount;
    private String currentUserReaction;
}
