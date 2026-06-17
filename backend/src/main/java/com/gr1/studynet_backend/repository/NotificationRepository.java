package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Lấy tất cả thông báo của một người, xếp từ mới nhất xuống cũ nhất
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    
    // Đếm số lượng thông báo CHƯA ĐỌC để hiển thị số lượng màu đỏ lên icon quả chuông
    long countByReceiverIdAndIsReadFalse(Long receiverId);

    java.util.Optional<Notification> findByIdAndReceiverId(Long id, Long receiverId);
}
