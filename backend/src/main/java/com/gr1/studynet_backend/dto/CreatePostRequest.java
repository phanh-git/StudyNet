package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePostRequest {
    private String content;

    private String fileUrl;

    private String fileName;

    private String fileType;

    @jakarta.validation.constraints.NotBlank(message = "Loại bài viết là bắt buộc")
    private String type;

    @NotNull(message = "Người đăng là bắt buộc")
    private Long userId;

    private Long groupId;

    private Long subjectId;
}
