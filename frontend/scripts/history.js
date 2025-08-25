const tbody = document.querySelector("tbody");
const message = document.getElementById("message");
const user = JSON.parse(localStorage.getItem("user"));

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

async function fetchHistory() {
  try {
    const [expensesRes, paymentsRes] = await Promise.all([
      fetch("http://localhost:5000/api/get-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      }),
      fetch("http://localhost:5000/api/get-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      }),
    ]);

    const expensesData = await expensesRes.json();
    const paymentsData = await paymentsRes.json();

    const expenses = expensesData.expenses || [];
    const payments = paymentsData.payments || [];

    tbody.innerHTML = "";

    const allTransactions = [
      ...expenses.map((e) => ({
        ...e,
        type: "Expense",
        displayAmount: `- ${e.amount}`,
        displayDesc: e.description,
      })),
      ...payments.map((p) => ({
        ...p,
        type: "Payment",
        displayAmount: `- ${p.amount}`,
        displayDesc: `${p.description} (${p.method})`,
      })),
    ];

    allTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(item.date)}</td>
          <td>${item.displayDesc} (${item.type})</td>
          <td>${item.displayAmount}</td>
          <td><button onclick="deleteTransaction('${item._id}', '${item.type.toLowerCase()}')">Delete</button></td>
        `;
        tbody.appendChild(row);
      });

    if (allTransactions.length === 0) {
      message.textContent = "No transaction data available.";
    }

  } catch (err) {
    console.error("❌ Error fetching history:", err);
    message.textContent = "⚠️ Error loading history.";
  }
}

async function deleteTransaction(id, type) {
  const endpoint =
    type === "expense"
      ? "http://localhost:5000/api/delete-expense"
      : "http://localhost:5000/api/delete-payment";

  try {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId: user._id }),
    });

    if (res.ok) {
      fetchHistory(); // Yenilə
    } else {
      throw new Error("Failed to delete transaction");
    }
  } catch (err) {
    console.error("❌ Error deleting transaction:", err);
  }
}

fetchHistory();
