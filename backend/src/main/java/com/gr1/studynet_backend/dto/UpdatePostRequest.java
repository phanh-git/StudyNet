package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePostRequest {
    private String content;

    private String fileUrl;

    private String fileName;

    private String fileType;

    @NotBlank(message = "Loại bài viết là bắt buộc")
    private String type;

    private Long userId;
}
