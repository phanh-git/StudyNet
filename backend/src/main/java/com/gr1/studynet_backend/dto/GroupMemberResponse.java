package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupMemberResponse {
    private Long userId;
    private String fullName;
    private String school;
    private String role;
    private String membershipStatus;
}
