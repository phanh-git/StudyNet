package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Hàm tự sinh dùng để kiểm tra đăng nhập hoặc check trùng email khi đăng ký
    Optional<User> findByEmail(String email);
}