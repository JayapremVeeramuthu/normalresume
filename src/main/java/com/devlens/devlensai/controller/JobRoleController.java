package com.devlens.devlensai.controller;

import com.devlens.devlensai.entity.JobRole;
import com.devlens.devlensai.repository.JobRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/job")
@RequiredArgsConstructor
public class JobRoleController {

    private final JobRoleRepository jobRoleRepository;

    @PostMapping
    public JobRole createJob(@RequestBody JobRole jobRole) {
        return jobRoleRepository.save(jobRole);
    }

    @GetMapping
    public List<JobRole> getAllJobs() {
        return jobRoleRepository.findAll();
    }
}