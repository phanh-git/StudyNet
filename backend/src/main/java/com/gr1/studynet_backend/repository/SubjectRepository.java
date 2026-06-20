package com.gr1.studynet_backend.repository;

import com.gr1.studynet_backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByNameIgnoreCase(String name);

    boolean existsByCodeIgnoreCase(String code);
}
