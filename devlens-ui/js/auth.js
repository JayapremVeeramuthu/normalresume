async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await apiRequest("/auth/login", "POST", {
    email,
    password
  });

  console.log(res); // 👈 IMPORTANT DEBUG

  if (!res.token) {
    alert("Login failed");
    return;
  }

  localStorage.setItem("token", res.token);

  if (res.role === "ADMIN") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "user.html";
  }
}