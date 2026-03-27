// ==========================
// 📁 FILE SELECT HANDLING
// ==========================
let selectedFile = null;

function onFileChange(input) {
  if (input.files[0]) {
    applyFile(input.files[0]);
  }
}

function applyFile(file) {
  selectedFile = file;

  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatBytes(file.size);
  document.getElementById('fileSelected').classList.add('show');
  document.getElementById('analyzeBtn').disabled = false;
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(1) + ' MB';
}


// ==========================
// 🚀 ANALYZE RESUME (REAL API)
// ==========================
async function analyzeResume() {
  if (!selectedFile) {
    showToast("Please upload a file", true);
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;

  document.getElementById('resultPanel').classList.remove('show');
  const progressWrap = document.getElementById('progressWrap');
  progressWrap.classList.add('show');

  simulateProgress();

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const targetRole = document.getElementById('targetRole').value;
    const expLevel = document.getElementById('expLevel').value;

    formData.append("targetRole", targetRole);
    formData.append("experience", expLevel);

    const res = await fetch("http://localhost:8080/api/resume/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    showResult(data);

  } catch (err) {
    console.error(err);
    showToast("Analysis failed", true);
    btn.disabled = false;
  }
}


// ==========================
// ⏳ PROGRESS SIMULATION
// ==========================
function simulateProgress() {
  const steps = ['step0','step1','step2','step3'];
  const pcts  = [20, 45, 75, 100];

  let i = 0;

  steps.forEach(id => document.getElementById(id).className = 'step-item');

  function run() {
    if (i >= steps.length) return;

    document.getElementById(steps[i]).className = 'step-item active';
    if (i > 0) document.getElementById(steps[i-1]).className = 'step-item done';

    document.getElementById('progressFill').style.width = pcts[i] + '%';
    document.getElementById('progressPct').textContent = pcts[i] + '%';

    i++;
    setTimeout(run, 500);
  }

  run();
}


// ==========================
// 📊 SHOW RESULT (REAL DATA)
// ==========================
function showResult(data) {
  document.getElementById('progressWrap').classList.remove('show');
  document.getElementById('resultPanel').classList.add('show');

  const score = data.score || 0;
  const skills = data.skills || [];
  const suggestions = data.suggestions || [];

  // 🔥 SCORE
  const cls = score >= 85 ? 'high' : score >= 70 ? 'mid' : 'low';
  const verdict = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Work';

  const numEl = document.getElementById('scoreNum');
  numEl.textContent = score;
  numEl.className = 'score-num ' + cls;

  const vEl = document.getElementById('scoreVerdict');
  vEl.textContent = verdict;
  vEl.className = 'score-verdict ' + cls;

  // 🔥 BREAKDOWN (OPTIONAL FROM BACKEND)
  const breakdown = data.breakdown || [
    { label: "Skills", value: score },
    { label: "Experience", value: score - 10 },
    { label: "Education", value: score - 20 },
    { label: "Format", value: score - 15 }
  ];

  const bd = document.getElementById('scoreBreakdown');
  bd.innerHTML = breakdown.map(d => {
    const pct = Math.max(0, Math.min(100, d.value));
    return `
      <div class="breakdown-row">
        <div class="breakdown-label">${d.label}</div>
        <div class="breakdown-track">
          <div class="breakdown-fill" style="width:${pct}%"></div>
        </div>
        <div class="breakdown-val">${pct}%</div>
      </div>
    `;
  }).join('');

  // 🔥 SKILLS
  document.getElementById('skillsGrid').innerHTML =
    skills.map(s => `<span class="tag tag-blue">${s}</span>`).join('');

  document.getElementById('skillCount').textContent =
    skills.length + " found";

  // 🔥 SUGGESTIONS
  document.getElementById('suggestionList').innerHTML =
    suggestions.map((s, i) => `
      <div class="suggestion-item">
        <span class="sug-index">${String(i+1).padStart(2,'0')}</span>
        <span class="sug-text">${s}</span>
      </div>
    `).join('');

  showToast("Analysis complete 🚀");
  document.getElementById('analyzeBtn').disabled = false;
}


// ==========================
// 🔄 RESET
// ==========================
function resetAll() {
  selectedFile = null;

  document.getElementById('file').value = '';
  document.getElementById('fileSelected').classList.remove('show');
  document.getElementById('fileName').textContent = '—';
  document.getElementById('fileSize').textContent = '—';

  document.getElementById('progressWrap').classList.remove('show');
  document.getElementById('resultPanel').classList.remove('show');

  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('targetRole').value = '';
  document.getElementById('expLevel').value = '';
}


// ==========================
// 🔔 TOAST
// ==========================
function showToast(msg, isErr = false) {
  const t = document.getElementById('toast');
  const color = isErr ? 'var(--danger)' : 'var(--accent)';

  t.style.borderColor = color;
  document.getElementById('toastDot').style.background = color;
  document.getElementById('toastMsg').style.color = color;
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastTime').textContent =
    new Date().toTimeString().slice(0,8);

  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}