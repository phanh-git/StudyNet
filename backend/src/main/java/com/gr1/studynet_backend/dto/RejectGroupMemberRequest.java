package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectGroupMemberRequest {
    private Long userId;

    @NotBlank(message = "Vui lòng nhập lý do từ chối.")
    private String reason;
}
