package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReactionRequest {
    private Long userId;

    @NotBlank(message = "Loại cảm xúc là bắt buộc")
    private String type;
}
