package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GroupPageResponse {
    private List<GroupResponse> items;
    private int page;
    private int size;
    private int totalPages;
    private long totalItems;
    private long joinedCount;
}
