package com.devlens.devlensai.repository;

import com.devlens.devlensai.entity.GitHubProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GitHubRepository extends JpaRepository<GitHubProfile, Long> {
}