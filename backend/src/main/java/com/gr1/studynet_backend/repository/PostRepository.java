package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // 1. Lấy bài viết cho Newsfeed chung
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findPublicPostsForNewsfeed();

    // 2. FILTER: Lọc bài viết theo môn học từ trang chủ
    @Query("SELECT p FROM Post p LEFT JOIN p.subject s WHERE s.id = :subjectId ORDER BY p.createdAt DESC")
    List<Post> filterPublicPostsBySubject(@Param("subjectId") Long subjectId);

    @Query("SELECT p FROM Post p LEFT JOIN p.subject s WHERE (:subjectId IS NULL OR s.id = :subjectId) AND (:type IS NULL OR p.type = :type) ORDER BY p.createdAt DESC")
    List<Post> findFilteredPublicPosts(@Param("subjectId") Long subjectId, @Param("type") String type);

    @Query("""
        SELECT p
        FROM Post p
        JOIN p.group g
        JOIN GroupMember gm ON gm.group = g
        LEFT JOIN p.subject s
        WHERE gm.user.id = :userId
          AND gm.membershipStatus = 'APPROVED'
          AND (:subjectId IS NULL OR s.id = :subjectId)
          AND (:type IS NULL OR p.type = :type)
        ORDER BY p.createdAt DESC
        """)
    List<Post> findFeedPostsForUser(@Param("userId") Long userId, @Param("subjectId") Long subjectId, @Param("type") String type);

    // 3. Lấy toàn bộ bài viết bên trong một nhóm cụ thể (Dùng khi click hẳn vào trong nhóm đó)
    List<Post> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    long countByGroupId(Long groupId);

    long countByUserId(Long userId);

    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Post> findByGroupId(Long groupId);

    void deleteByGroupId(Long groupId);
}
