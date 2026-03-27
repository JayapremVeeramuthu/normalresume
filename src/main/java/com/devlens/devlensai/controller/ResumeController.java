package com.devlens.devlensai.controller;

import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.devlens.devlensai.service.ResumeService;

@RestController
@RequestMapping("/candidate")
public class ResumeController {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload")
    public Object uploadResume(@RequestParam("file") MultipartFile file) {

        try {

            // ✅ Check empty file
            if (file.isEmpty()) {
                return "❌ File is empty!";
            }

            // ✅ Create folder
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // ✅ Safe filename
            String fileName = file.getOriginalFilename();
            if (fileName == null || fileName.contains("..")) {
                return "❌ Invalid file name!";
            }

            // ✅ Save file
            String filePath = UPLOAD_DIR + fileName;
            file.transferTo(new File(filePath));

            // 🔥 AI PART START
            String content = resumeService.extractText(filePath);

            return content;

        } catch (Exception e) {
            e.printStackTrace();
            return "❌ Error: " + e.getMessage();
        }
    }
}