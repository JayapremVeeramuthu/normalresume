package com.devlens.devlensai.repository;

import com.devlens.devlensai.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByMatchScoreGreaterThanEqual(double score);
    List<Resume> findByStatus(String status);
}