package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateGroupRequest {
    @NotBlank(message = "Tên nhóm là bắt buộc")
    private String name;

    @NotBlank(message = "Mô tả nhóm là bắt buộc")
    private String description;

    @NotBlank(message = "Trạng thái nhóm là bắt buộc")
    private String status;

    @NotNull(message = "Người tạo nhóm là bắt buộc")
    private Long creatorId;

    @NotNull(message = "Môn học là bắt buộc")
    private Long subjectId;
}
