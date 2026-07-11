package com.gr1.studynet_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateGroupRequest {
    @NotBlank(message = "Tên nhóm là bắt buộc")
    private String name;

    @NotBlank(message = "Mô tả nhóm là bắt buộc")
    private String description;

    @jakarta.validation.constraints.NotNull(message = "Người tạo nhóm là bắt buộc")
    private Long creatorId;

    private Long subjectId;

    private String customSubjectName;
}
