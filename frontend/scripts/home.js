const storedUser = localStorage.getItem("user");

if (!storedUser) {
  alert("⚠️ User not found. Please log in again.");
  window.location.href = "login.html";
}

let user;
try {
  user = JSON.parse(storedUser);
} catch (err) {
  alert("⚠️ Corrupted user data. Please log in again.");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

if (!user._id) {
  alert("⚠️ Invalid user ID. Please log in again.");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

async function fetchUserData() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/user`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById("username").textContent = data.name;
      document.getElementById("balance").textContent = `₼${data.balance.toFixed(2)}`;
    } else {
      alert("❌ Failed to load user data.");
    }
  } catch (error) {
    console.error("❌ Server error:", error);
    alert("❌ Server error while loading user data.");
  }
}

function goTo(page) {
  window.location.href = `${page}.html`;
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

fetchUserData();
