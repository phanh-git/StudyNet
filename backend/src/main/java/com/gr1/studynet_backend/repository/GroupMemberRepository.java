package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByUserId(Long userId);

    // Lấy danh sách tất cả thành viên của 1 nhóm
    List<GroupMember> findByGroupId(Long groupId);

    long countByGroupId(Long groupId);
    
    // Kiểm tra xem một User cụ thể đã tham gia vào một Group cụ thể chưa
    Optional<GroupMember> findByUserIdAndGroupId(Long userId, Long groupId);
}
