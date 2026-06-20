package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GroupDetailResponse {
    private GroupResponse group;
    private List<GroupMemberResponse> members;
    private List<FeedPostResponse> posts;
}
