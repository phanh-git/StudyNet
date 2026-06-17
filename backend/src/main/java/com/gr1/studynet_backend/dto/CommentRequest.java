package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentRequest {
    @NotNull(message = "Người bình luận là bắt buộc")
    private Long userId;

    @NotBlank(message = "Nội dung bình luận là bắt buộc")
    private String content;
}
