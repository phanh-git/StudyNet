package com.gr1.studynet_backend.dto;

import lombok.Data;

@Data
public class CreatePostRequest {
    private String content;

    private String fileUrl;

    private String fileName;

    private String fileType;

    @jakarta.validation.constraints.NotBlank(message = "Loại bài viết là bắt buộc")
    private String type;

    private Long userId;

    private Long groupId;

    private Long subjectId;
}
