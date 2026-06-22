package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AdminOverviewResponse {
    private long totalUsers;
    private long totalAdmins;
    private long totalGroups;
    private long totalPosts;
    private long totalSubjects;
    private long totalNotifications;
    private List<AdminUserRowResponse> recentUsers;
    private List<AdminGroupRowResponse> recentGroups;
    private List<FeedPostResponse> recentPosts;
}
