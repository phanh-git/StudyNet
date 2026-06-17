package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReactionRequest {
    @NotNull(message = "Người thả cảm xúc là bắt buộc")
    private Long userId;

    @NotBlank(message = "Loại cảm xúc là bắt buộc")
    private String type;
}
