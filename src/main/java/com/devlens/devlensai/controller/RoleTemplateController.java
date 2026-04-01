package com.devlens.devlensai.controller;

import com.devlens.devlensai.entity.RoleTemplate;
import com.devlens.devlensai.repository.RoleTemplateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoleTemplateController {

    private final RoleTemplateRepository roleTemplateRepository;

    @PostConstruct
    public void initTemplates() {
        if (roleTemplateRepository.count() > 0) {
            roleTemplateRepository.deleteAll(); // Wipe old templates to cleanly seed the exact requested roles
        }
        
        RoleTemplate backend = new RoleTemplate(null, "Backend Developer", "Engineering", List.of("java", "spring boot", "mysql", "api", "hibernate", "rest"), "3+ years", "Responsible for server-side logic, APIs, and database management.");
        RoleTemplate frontend = new RoleTemplate(null, "Frontend Developer", "Engineering", List.of("react", "javascript", "css", "html", "nextjs", "ui components"), "2+ years", "Responsible for responsive user interface and seamless user experience.");
        RoleTemplate fullstack = new RoleTemplate(null, "Full Stack Developer", "Engineering", List.of("java", "spring boot", "react", "mysql", "javascript", "html", "css", "git"), "4+ years", "Handles both frontend and backend development lifecycles.");
        RoleTemplate uiux = new RoleTemplate(null, "UI/UX Designer", "Design", List.of("figma", "adobe xd", "wireframing", "prototyping", "user research"), "2+ years", "Designs intuitive and engaging user interfaces based on solid UX research.");
        RoleTemplate devops = new RoleTemplate(null, "DevOps Engineer", "Engineering", List.of("aws", "docker", "kubernetes", "ci/cd", "linux", "jenkins"), "3+ years", "Manages infrastructure, deployments, and maintains CI/CD pipelines.");
        
        roleTemplateRepository.saveAll(List.of(backend, frontend, fullstack, uiux, devops));
    }

    @GetMapping
    public ResponseEntity<List<RoleTemplate>> getAllTemplates() {
        return ResponseEntity.ok(roleTemplateRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleTemplate> getTemplateById(@PathVariable Long id) {
        return roleTemplateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RoleTemplate> createTemplate(@RequestBody RoleTemplate template) {
        return ResponseEntity.ok(roleTemplateRepository.save(template));
    }
}
