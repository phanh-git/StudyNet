package com.gr1.studynet_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data // Lombok tự sinh getter, setter, toString
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String fullName;

    private String school;

    private String major;

    @Column(columnDefinition = "TEXT")
    private String interestedSubjects;

    @Column(nullable = false, length = 10)
    private String role; // "USER" hoặc "ADMIN"

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
