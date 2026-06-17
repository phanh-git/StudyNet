package com.gr1.studynet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String message;
    private String senderName;
    private String targetUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
