package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SharePostRequest {
    @NotNull(message = "Thiếu thông tin người dùng.")
    private Long userId;
    private String content;
}
