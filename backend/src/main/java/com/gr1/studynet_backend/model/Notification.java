package com.gr1.studynet_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver; // Người nhận (User hoặc Admin)

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender; // Người thực hiện hành động gây ra thông báo

    @Column(nullable = false, length = 30)
    private String type; // "LIKE", "COMMENT", "GROUP_REQUEST", etc.

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private Boolean isRead = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
