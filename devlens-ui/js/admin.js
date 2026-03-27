// ==========================
// 🔁 SECTION SWITCH
// ==========================
function showSection(id, btn) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('breadcrumb').textContent = id.toUpperCase();

  if (id === "candidates") {
    loadCandidates();
  }
}


// ==========================
// 🚀 CREATE JOB (REAL API)
// ==========================
async function createJob() {
  const titleEl = document.getElementById('jobTitle');
  const department = document.getElementById('department').value.trim();
  const skillsInput = document.getElementById('skills').value.trim();
  const experience = document.getElementById('experience').value.trim();
  const description = document.getElementById('jobDesc').value.trim();

  const title = titleEl.value.trim();
  titleEl.classList.remove('err');

  if (!title) {
    titleEl.classList.add('err');
    titleEl.focus();
    showToast("Job title is required", true);
    return;
  }

  const skills = skillsInput.split(",").map(s => s.trim()).filter(s => s);

  try {
    await apiRequest("/jobs", "POST", {
      title,
      department,
      skills,
      experience,
      description
    });

    showToast(`"${title}" published successfully`);

    // clear form
    ['jobTitle','department','skills','experience','jobDesc']
      .forEach(id => document.getElementById(id).value = '');

    // reset preview
    ['preview-title','preview-dept','preview-skills','preview-exp']
      .forEach(id => document.getElementById(id).textContent = '—');

  } catch (err) {
    showToast("Error creating job", true);
    console.error(err);
  }
}


// ==========================
// 👨‍💼 LOAD CANDIDATES (REAL)
// ==========================
async function loadCandidates() {
  try {
    const data = await apiRequest("/candidates");

    const container = document.getElementById("candidateList");

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="empty">
          <div class="empty-msg">No Candidates Yet</div>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Candidate</th>
              <th>Role</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="candTbody"></tbody>
        </table>
      </div>
    `;

    const tbody = document.getElementById("candTbody");

    data.forEach((c, index) => {
      const score = c.score || 0;

      let cls = "low";
      if (score >= 85) cls = "high";
      else if (score >= 70) cls = "mid";

      const row = `
        <tr>
          <td class="cell-id">${String(index + 1).padStart(3, '0')}</td>
          <td class="cell-name">${c.name || "Unknown"}</td>
          <td class="cell-role">${c.jobTitle || "-"}</td>
          <td>
            <div class="score-wrap">
              <div class="score-track">
                <div class="score-fill ${cls}" style="width:${score}%"></div>
              </div>
              <span class="score-val">${score}%</span>
            </div>
          </td>
          <td><span class="tag tag-blue">Analyzed</span></td>
        </tr>
      `;

      tbody.innerHTML += row;
    });

    document.getElementById('cand-count').textContent = `${data.length} Active`;

  } catch (err) {
    console.error(err);
    showToast("Failed to load candidates", true);
  }
}


// ==========================
// 🔄 AUTO REFRESH (REALTIME)
// ==========================
setInterval(() => {
  const isActive = document.getElementById("candidates").classList.contains("active");
  if (isActive) {
    loadCandidates();
  }
}, 5000); // every 5 sec


// ==========================
// 🚨 TOAST (KEEP SAME)
// ==========================
function showToast(msg, isErr = false) {
  const t = document.getElementById('toast');
  const dot = document.getElementById('toastDot');
  const msgEl = document.getElementById('toastMsg');

  const color = isErr ? 'var(--danger)' : 'var(--accent)';

  t.style.borderColor = color;
  dot.style.background = color;
  msgEl.style.color = color;
  msgEl.textContent = msg;

  document.getElementById('toastTime').textContent =
    new Date().toTimeString().slice(0,8);

  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}