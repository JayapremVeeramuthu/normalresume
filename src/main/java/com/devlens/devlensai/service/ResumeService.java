package com.devlens.devlensai.service;

import com.devlens.devlensai.dto.ResumeUploadResponse;
import com.devlens.devlensai.entity.Resume;
import com.devlens.devlensai.repository.ResumeRepository;
import com.devlens.devlensai.repository.JobRepository;
import com.devlens.devlensai.entity.Job;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final Tika tika = new Tika();

    private final String UPLOAD_DIR = "uploads/";

    public ResumeUploadResponse processResume(MultipartFile file, String roleName) throws Exception {
        return uploadResume(file, roleName);
    }

    public ResumeUploadResponse uploadResume(MultipartFile file, String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new RuntimeException("Role is missing");
        }
        
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File validation failed: File is null or empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String lower = originalFilename.toLowerCase();
            if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
                throw new IllegalArgumentException("File validation failed: Only PDF and DOCX files are permitted");
            }
        }

        long maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File validation failed: File exceeds maximum allowed size of 5MB");
        }

        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/";

            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.io.File dest = new java.io.File(uploadDir + fileName);

            file.transferTo(dest);

            System.out.println("====== DEBUG: RESUME ANALYSIS ======");
            Job job = jobRepository.findFirstByTitle(roleName).orElse(null);
            
            if (job == null) {
                throw new RuntimeException("Role not found in DB: " + roleName);
            }
            
            Object rawSkills = job.getSkills();
            java.util.List<String> requiredSkills = new java.util.ArrayList<>();
            if (rawSkills != null) {
                String cleanedString = rawSkills.toString().replaceAll("[\\[\\]\"]", "");
                for (String s : cleanedString.split(",")) {
                    if (!s.trim().isEmpty()) {
                        requiredSkills.add(s.trim());
                    }
                }
            }

            if (requiredSkills.isEmpty()) {
                throw new RuntimeException("No skills found for role");
            }
            
            System.out.println("ROLE RECEIVED: " + roleName);
            System.out.println("DB JOB: " + job.getTitle());
            System.out.println("SKILLS: " + requiredSkills);
            
            String content;
            try (InputStream stream = Files.newInputStream(dest.toPath())) {
                content = tika.parseToString(stream).toLowerCase();
            }

            List<String> extractedSkills = new ArrayList<>();
            List<String> missingSkills = new ArrayList<>();

            for (String skill : requiredSkills) {
                if (content.contains(skill.toLowerCase())) {
                    extractedSkills.add(skill);
                } else {
                    missingSkills.add(skill);
                }
            }

            int matchedCount = extractedSkills.size();
            int totalJobSkills = requiredSkills != null ? requiredSkills.size() : 0;
            double matchScore = totalJobSkills == 0 ? 0 : ((double) matchedCount / totalJobSkills) * 100;

            Resume resume = new Resume();
            resume.setJob(job);
            resume.setFileUrl(dest.getAbsolutePath());
            resume.setExtractedSkills(extractedSkills);
            resume.setScore((int) matchScore);
            resume.setMatchScore(matchScore);
            resume.setRole(roleName);
            resume.setTotalRoleSkills(totalJobSkills);
            
            // Basic dummy experience extraction logic, assuming N/A since it requires NLP
            resume.setExperience("N/A - Extracted via Score");

            if (matchScore >= 60) {
                resume.setStatus("SELECTED");
            } else {
                resume.setStatus("REJECTED");
            }

            resumeRepository.save(resume);

            ResumeUploadResponse response = new ResumeUploadResponse();
            response.setResume(resume);
            response.setMissingSkills(missingSkills);

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Analysis failed: " + e.getMessage());
        }
    }

    public List<Resume> getMatchedResumes() {
        return resumeRepository.findByMatchScoreGreaterThanEqual(50.0);
    }

    public List<Resume> getSelectedResumes() {
        return resumeRepository.findByStatus("SELECTED");
    }
}