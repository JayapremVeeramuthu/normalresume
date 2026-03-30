async function analyzeResume() {
  const file = document.getElementById("file").files[0];

  if (!file) {
    alert("Upload file bro 😅");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8080/api/candidate/upload", {
    method: "POST",
    body: formData // 🔥 NO headers here
  });

  const data = await res.json();
  console.log("RESULT:", data);
}