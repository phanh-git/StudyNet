package com.gr1.studynet_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
    name = "reactions",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"post_id", "user_id"})}
)
@Data
public class Reaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 10)
    private String type; // "LIKE", "HEART", "HAHA", "WOW", "SAD"
}