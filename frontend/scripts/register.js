document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.status === 201) {
      localStorage.setItem("user", JSON.stringify({
        _id: data.user.userId,
        name: data.user.name
      }));

      window.location.href = "home.html";
    } else {
      alert(data.error || data.message);
    }
  } catch (error) {
    alert("❌ Server error");
  }
});
