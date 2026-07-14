package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
public class AdminUserRowResponse {
    private Long id;
    private String fullName;
    private String email;
    private String school;
    private String major;
    private String role;
    private long joinedGroupCount;
    private long postCount;
    private LocalDateTime createdAt;
}
