package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    // Tìm các nhóm công khai (PUBLIC) để hiển thị ngoài trang chủ
    List<Group> findByStatus(String status);
    
    // Tìm kiếm nhóm theo từ khóa tên nhóm (không phân biệt chữ hoa/thường)
    List<Group> findByNameContainingIgnoreCase(String keyword);

    List<Group> findBySubjectId(Long subjectId);
}
