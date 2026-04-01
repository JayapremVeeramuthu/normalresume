package com.devlens.devlensai.repository;

import com.devlens.devlensai.entity.RoleTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleTemplateRepository extends JpaRepository<RoleTemplate, Long> {
    Optional<RoleTemplate> findByRoleName(String roleName);
}
