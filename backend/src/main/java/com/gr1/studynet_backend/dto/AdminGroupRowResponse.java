package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AdminGroupRowResponse {
    private Long id;
    private String name;
    private String subjectName;
    private String creatorName;
    private String status;
    private long memberCount;
    private long postCount;
    private LocalDateTime createdAt;
}
