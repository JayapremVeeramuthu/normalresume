package com.devlens.devlensai.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Resume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileUrl;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> extractedSkills;

    private int score;
    private double matchScore;
    
    // Also include experience for completion based on requirement: "experience"
    private String experience;
    
    // Status to track if the candidate is SELECTED or REJECTED based on score
    private String status;

    private String role;
    
    private int totalRoleSkills;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
}