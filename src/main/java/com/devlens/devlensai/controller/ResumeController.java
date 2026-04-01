package com.devlens.devlensai.controller;

import com.devlens.devlensai.dto.ResumeUploadResponse;
import com.devlens.devlensai.entity.Resume;
import com.devlens.devlensai.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/candidate/upload")
    public ResponseEntity<?> uploadResume(@RequestParam(value = "file", required = false) MultipartFile file, @RequestParam(value = "role", required = false) String role) {
        System.out.println("=== API HIT ===");
        System.out.println("ROLE: " + role);
        System.out.println("FILE: " + (file != null ? file.getOriginalFilename() : "null"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is missing");
        }

        if (role == null || role.isEmpty()) {
            throw new RuntimeException("Role is missing");
        }

        try {
            ResumeUploadResponse response = resumeService.processResume(file, role);
            if (response == null || response.getResume() == null) {
                return ResponseEntity.status(500).body(java.util.Map.of("error", "Analysis failed: internal error"));
            }
            
            double score = response.getResume().getMatchScore();
            java.util.List<String> matchedSkills = response.getResume().getExtractedSkills();
            java.util.List<String> missingSkills = response.getMissingSkills();
            
            System.out.println("FINAL RESPONSE: " + score + matchedSkills + missingSkills);
            
            return ResponseEntity.ok(java.util.Map.of(
                "matchScore", score,
                "matchedSkills", matchedSkills,
                "missingSkills", missingSkills
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @GetMapping("/admin/resumes")
    public ResponseEntity<List<Resume>> getMatchedResumes() {
        return ResponseEntity.ok(resumeService.getMatchedResumes());
    }

    @GetMapping("/admin/resumes/selected")
    public ResponseEntity<List<Resume>> getSelectedResumes() {
        return ResponseEntity.ok(resumeService.getSelectedResumes());
    }
}