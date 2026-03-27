package com.devlens.devlensai.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devlens.devlensai.entity.Resume;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
}