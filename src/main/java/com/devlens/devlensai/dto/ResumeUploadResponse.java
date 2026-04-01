package com.devlens.devlensai.dto;

import com.devlens.devlensai.entity.Resume;
import lombok.Data;

import java.util.List;

@Data
public class ResumeUploadResponse {
    private Resume resume;
    private List<String> missingSkills;
}
