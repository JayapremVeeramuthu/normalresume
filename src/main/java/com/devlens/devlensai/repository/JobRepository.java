package com.devlens.devlensai.repository;

import com.devlens.devlensai.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {
    Optional<Job> findFirstByTitle(String title);
}
