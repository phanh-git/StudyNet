package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    // Đếm tổng số lượt tương tác (Like/Heart...) của 1 bài viết
    long countByPostId(Long postId);
    
    // Đếm riêng từng loại tương tác (Ví dụ: Có bao nhiêu lượt 'LIKE', bao nhiêu 'HEART')
    long countByPostIdAndType(Long postId, String type);

    // Tìm xem một người dùng cụ thể đã thả cảm xúc vào bài viết này chưa
    Optional<Reaction> findByPostIdAndUserId(Long postId, Long userId);

    void deleteByPostIdIn(Collection<Long> postIds);
}
