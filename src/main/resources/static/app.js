const BASE_URL = "http://localhost:8082/api";

document.addEventListener("DOMContentLoaded", () => {
    // Determine page by checking IDs
    if (document.getElementById("roleSelect")) {
        loadJobsDropdown();
    }
    if (document.getElementById("jobsTableBody")) {
        fetchAdminJobs();
        fetchMatchedResumes();
    }
});

/* =========================================
   CANDIDATE PORTAL LOGIC
   ========================================= */

async function loadJobsDropdown() {
    try {
        const res = await fetch(BASE_URL + "/jobs");
        const jobs = await res.json();
        const select = document.getElementById("roleSelect");
        
        select.innerHTML = '<option value="">-- Select a Target Role --</option>';
        
        jobs.forEach(job => {
            const option = document.createElement("option");
            option.value = job.title; // Using title as the role string for the backend lookup
            option.textContent = job.title;
            select.appendChild(option);
        });
    } catch (e) {
        console.error("Error fetching jobs", e);
    }
}

async function uploadResume() {
    const fileInput = document.getElementById("resumeFile");
    const roleSelect = document.getElementById("roleSelect");
    
    const file = fileInput.files[0];
    const role = roleSelect.value;
    
    if (!role) {
        alert("Please select a role");
        return;
    }
    
    if (!file) {
        alert("Please select your resume document.");
        return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("resultSection").classList.add("hidden");
    
    try {
        const response = await fetch(BASE_URL + "/candidate/upload", {
            method: "POST",
            body: formData
        });
        
        let result;
        try {
            result = await response.json();
        } catch(err) {
            alert("Upload failed. Make sure your backend is running.");
            return;
        }

        if (!response.ok) {
            alert(result.error || "Upload failed");
            return;
        }
        
        displayResults(result);
    } catch (e) {
        console.error("Error uploading", e);
        alert("Server error uploading resume.");
    } finally {
        document.getElementById("loader").classList.add("hidden");
    }
}

function displayResults(data) {
    if (!data || data.matchScore == null) {
        alert("Invalid response from server");
        return;
    }

    document.getElementById("resultSection").classList.remove("hidden");
    const score = Math.round(data.matchScore);
    
    // Animate Score update
    const scoreValue = document.getElementById("scoreValue");
    const scoreCircle = document.getElementById("scoreCircle");
    
    // Change color based on score
    let color = 'var(--success)';
    if(score < 50) color = 'var(--danger)';
    else if(score < 75) color = 'var(--warning)';
    
    scoreValue.style.color = color;
    scoreValue.textContent = `${score}%`;
    scoreCircle.style.background = `conic-gradient(${color} ${score}%, rgba(255,255,255,0.05) 0%)`;
    
    // Extracted Skills Badges
    const extContainer = document.getElementById("extractedSkills");
    extContainer.innerHTML = "";
    if (data.matchedSkills && data.matchedSkills.length > 0) {
        data.matchedSkills.forEach(s => {
            const span = document.createElement("span");
            span.className = "badge badge-skill";
            span.textContent = s;
            extContainer.appendChild(span);
        });
    } else {
        extContainer.innerHTML = "<em style='color:var(--text-secondary)'>None found</em>";
    }

    // Missing Skills Badges (Bonus features)
    const missContainer = document.getElementById("missingSkills");
    missContainer.innerHTML = "";
    if (data.missingSkills && data.missingSkills.length > 0) {
        data.missingSkills.forEach(s => {
            const span = document.createElement("span");
            span.className = "badge badge-missing";
            span.textContent = s;
            missContainer.appendChild(span);
        });
    } else {
        missContainer.innerHTML = "<em style='color:var(--success)'>Perfect match! No missing skills.</em>";
    }
}

/* =========================================
   ADMIN PORTAL LOGIC
   ========================================= */

const roleDataMap = {
    frontend: {
        title: "Frontend Developer",
        department: "Engineering",
        experience: "2+ years",
        skills: "react, javascript, css, html, nextjs",
        description: "Responsible for responsive user interface and seamless user experience."
    },
    backend: {
        title: "Backend Developer",
        department: "Engineering",
        experience: "3+ years",
        skills: "java, spring boot, mysql, api, rest",
        description: "Responsible for server-side logic, APIs, and database management."
    },
    fullstack: {
        title: "Full Stack Developer",
        department: "Engineering",
        experience: "4+ years",
        skills: "java, spring boot, react, mysql, javascript, css",
        description: "Handles both frontend and backend development lifecycles."
    },
    uiux: {
        title: "UI/UX Designer",
        department: "Design",
        experience: "2+ years",
        skills: "figma, adobe xd, wireframing, prototyping",
        description: "Designs intuitive and engaging user interfaces based on solid UX research."
    },
    devops: {
        title: "DevOps Engineer",
        department: "Engineering",
        experience: "3+ years",
        skills: "aws, docker, kubernetes, linux, jenkins",
        description: "Manages infrastructure, deployments, and maintains CI/CD pipelines."
    }
};

function populateRoleData() {
    const roleId = document.getElementById("roleSelect").value;
    console.log("Admin Selected Role ID:", roleId);
    
    if (!roleId) {
        document.getElementById("jobTitle").value = "";
        document.getElementById("jobDepartment").value = "";
        document.getElementById("jobExperience").value = "";
        document.getElementById("jobSkills").value = "";
        document.getElementById("jobDescription").value = "";
        console.log("No role selected, cleared fields.");
        return;
    }
    
    const data = roleDataMap[roleId];
    if (data) {
        console.log("Auto-populating data:", data);
        document.getElementById("jobTitle").value = data.title;
        document.getElementById("jobDepartment").value = data.department;
        document.getElementById("jobExperience").value = data.experience;
        document.getElementById("jobSkills").value = data.skills;
        document.getElementById("jobDescription").value = data.description;
    } else {
        console.warn("Role ID not found in mapping.");
    }
}

async function saveJob() {
    const title = document.getElementById("jobTitle").value;
    const department = document.getElementById("jobDepartment").value;
    const experience = document.getElementById("jobExperience").value;
    const skillsText = document.getElementById("jobSkills").value;
    const description = document.getElementById("jobDescription").value;
    
    if (!title || !department || !skillsText) {
        alert("Please fill required job fields.");
        return;
    }
    
    const skills = skillsText.split(",").map(s => s.trim().toLowerCase()).filter(s => s);
    
    const payload = {
        title, department, experience, skills, description
    };
    
    try {
        const res = await fetch(BASE_URL + "/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            // clear form
            document.getElementById("jobTitle").value = "";
            document.getElementById("jobDepartment").value = "";
            document.getElementById("jobExperience").value = "";
            document.getElementById("jobSkills").value = "";
            document.getElementById("jobDescription").value = "";
            
            fetchAdminJobs(); // reload
        }
    } catch (e) {
        console.error(e);
    }
}

async function fetchAdminJobs() {
    try {
        const res = await fetch(BASE_URL + "/jobs");
        const jobs = await res.json();
        
        const tbody = document.getElementById("jobsTableBody");
        tbody.innerHTML = "";
        if(jobs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No jobs registered yet.</td></tr>`;
            return;
        }

        jobs.forEach(job => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span style="color:var(--text-secondary)">#${job.id}</span></td>
                <td>
                    <strong>${job.title}</strong><br/>
                    <small style="color:var(--text-secondary)">${job.department}</small>
                </td>
                <td>
                    ${job.skills.map(s => `<span class="badge badge-skill">${s}</span>`).join(" ")}
                </td>
                <td>
                    <button onclick="deleteJob(${job.id})" class="danger-btn"><i class="ri-delete-bin-line"></i> Remove</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
    }
}

async function deleteJob(id) {
    if(!confirm("Are you sure you want to completely remove this target job?")) return;
    try {
        await fetch(BASE_URL + "/jobs/" + id, { method: "DELETE" });
        fetchAdminJobs();
    } catch(e) { console.error(e); }
}

async function fetchMatchedResumes() {
    try {
        const res = await fetch(BASE_URL + "/admin/resumes");
        const resumes = await res.json();
        
        const tbody = document.getElementById("resumesTableBody");
        tbody.innerHTML = "";
        
        if (resumes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No strong candidates found yet (&ge; 50%).</td></tr>`;
            return;
        }

        resumes.forEach(resume => {
            const tr = document.createElement("tr");
            let scoreMatch = Math.round(resume.matchScore);
            
            let badgeStyle = "background: rgba(16, 185, 129, 0.2); color: var(--success);";
            if (scoreMatch < 50) badgeStyle = "background: rgba(239, 68, 68, 0.2); color: var(--danger);"; // should not happen per requirement
            
            tr.innerHTML = `
                <td><span style="color:var(--text-secondary)">#${resume.id}</span></td>
                <td><strong>${resume.fileUrl.split('/').pop().split('\\').pop()}</strong></td>
                <td>
                    ${resume.extractedSkills.map(s => `<span class="badge badge-skill">${s}</span>`).join(" ")}
                </td>
                <td>${resume.role}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span class="badge" style="${badgeStyle}">${scoreMatch}%</span>
                        <small style="color:var(--text-secondary)">(${resume.score}/${resume.totalRoleSkills || 0})</small>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
    }
}
