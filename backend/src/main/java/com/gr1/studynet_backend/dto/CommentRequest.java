package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    private Long userId;

    @NotBlank(message = "Nội dung bình luận là bắt buộc")
    private String content;
}
