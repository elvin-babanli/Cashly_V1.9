const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

const token = localStorage.getItem("token");

document.getElementById("balanceForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const balance = parseFloat(document.getElementById("balance").value);

  const res = await fetch("http://localhost:5000/api/set-balance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ userId: user._id, balance }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ Balance successfully updated!");
  } else {
    alert("❌ Failed to update balance.");
  }
});

document.getElementById("expenseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("desc").value;
  const date = document.getElementById("date").value;

  const res = await fetch("http://localhost:5000/api/add-expense", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: user._id,
      amount,
      description,
      date,
    }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ Expense added successfully!");
    window.location.href = "history.html";
  } else {
    alert("❌ Failed to add expense.");
  }
});
