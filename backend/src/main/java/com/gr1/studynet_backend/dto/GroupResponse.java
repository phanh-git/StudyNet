package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private String status;
    private String role;
    private String subjectName;
    private Long subjectId;
    private long memberCount;
    private long postCount;
    private boolean joined;
    private boolean pending;
}
