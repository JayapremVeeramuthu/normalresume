package com.devlens.devlensai.service;

import java.io.File;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;

@Service
public class ResumeService {

    public String extractText(String filePath) {
        try {
            Tika tika = new Tika();
            return tika.parseToString(new File(filePath));
        } catch (Exception e) {
            e.printStackTrace();
            return "Error extracting text";
        }
    }
}