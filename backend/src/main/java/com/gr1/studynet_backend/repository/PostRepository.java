package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // 1. Lấy bài viết cho Newsfeed chung (Chỉ lấy bài cá nhân HOẶC bài nằm trong nhóm PUBLIC)
    @Query("SELECT p FROM Post p WHERE p.group IS NULL OR p.group.status = 'PUBLIC' ORDER BY p.createdAt DESC")
    List<Post> findPublicPostsForNewsfeed();

    // 2. FILTER: Lọc bài viết công khai theo môn học từ trang chủ
    @Query("SELECT p FROM Post p WHERE p.subject.id = :subjectId AND (p.group IS NULL OR p.group.status = 'PUBLIC') ORDER BY p.createdAt DESC")
    List<Post> filterPublicPostsBySubject(@Param("subjectId") Long subjectId);

    @Query("SELECT p FROM Post p WHERE (:subjectId IS NULL OR p.subject.id = :subjectId) AND (:type IS NULL OR p.type = :type) AND (p.group IS NULL OR p.group.status = 'PUBLIC') ORDER BY p.createdAt DESC")
    List<Post> findFilteredPublicPosts(@Param("subjectId") Long subjectId, @Param("type") String type);

    // 3. Lấy toàn bộ bài viết bên trong một nhóm cụ thể (Dùng khi click hẳn vào trong nhóm đó)
    List<Post> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    long countByGroupId(Long groupId);

    long countByUserId(Long userId);

    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);
}
