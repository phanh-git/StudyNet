package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RejectGroupMemberRequest {
    @NotNull(message = "Thiếu thông tin người duyệt.")
    private Long userId;

    @NotBlank(message = "Vui lòng nhập lý do từ chối.")
    private String reason;
}
