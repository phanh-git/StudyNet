package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class AdminUserRowResponse {
    private Long id;
    private String fullName;
    private String email;
    private String school;
    private String major;
    private String role;
    private List<String> interestedSubjects;
    private long joinedGroupCount;
    private long postCount;
    private LocalDateTime createdAt;
}
