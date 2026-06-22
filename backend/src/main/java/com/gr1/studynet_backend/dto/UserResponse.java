package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String school;
    private String major;
    private List<String> interestedSubjects;
    private String role;
}
