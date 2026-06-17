package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReactionSummaryResponse {
    private long reactionCount;
    private String currentUserReaction;
}
