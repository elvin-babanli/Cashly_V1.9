const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

const form = document.getElementById("paymentForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const method = document.getElementById("method").value;
  const description = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;

  if (!method || !description || !amount || !date) {
    message.textContent = "❌ All fields are required.";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/make-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        method,
        description,
        amount,
        date,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      user.balance = data.balance;
      localStorage.setItem("user", JSON.stringify(user));
      message.textContent = "✅ Payment successful!";
      form.reset();
    } else {
      message.textContent = `❌ ${data.message}`;
    }
  } catch (err) {
    console.error("Payment error:", err);
    message.textContent = "❌ Server error occurred.";
  }
});
