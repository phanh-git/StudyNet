package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Lấy tất cả bình luận của một bài viết, xếp từ cũ đến mới để đọc theo luồng thời gian
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);

    void deleteByPostIdIn(Collection<Long> postIds);
}
