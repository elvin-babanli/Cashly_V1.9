const user = JSON.parse(localStorage.getItem("user"));
const barChartCanvas = document.getElementById("barChart");
const pieChartCanvas = document.getElementById("pieChart");
const summaryTable = document.getElementById("summaryTable");

let barChart, pieChart;

async function fetchStats() {
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

    const dateMap = {};

    expenses.forEach((e) => {
      const d = new Date(e.date).toLocaleDateString();
      dateMap[d] = dateMap[d] || { expenses: 0, payments: 0 };
      dateMap[d].expenses += e.amount;
    });

    payments.forEach((p) => {
      const d = new Date(p.date).toLocaleDateString();
      dateMap[d] = dateMap[d] || { expenses: 0, payments: 0 };
      dateMap[d].payments += p.amount;
    });

    const labels = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
    const expensesByDate = labels.map((l) => dateMap[l].expenses);
    const paymentsByDate = labels.map((l) => dateMap[l].payments);

    if (barChart) barChart.destroy();
    barChart = new Chart(barChartCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Expenses",
            data: expensesByDate,
            backgroundColor: "#ff6384",
          },
          {
            label: "Payments",
            data: paymentsByDate,
            backgroundColor: "#36a2eb",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Expenses vs Payments by Date" },
        },
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

    if (pieChart) pieChart.destroy();
    pieChart = new Chart(pieChartCanvas, {
      type: "pie",
      data: {
        labels: ["Expenses", "Payments"],
        datasets: [
          {
            data: [totalExpenses, totalPayments],
            backgroundColor: ["#ff6384", "#36a2eb"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Total Expenses vs Payments" },
        },
      },
    });

    summaryTable.innerHTML = `
      <tr><td>Expenses</td><td>$${totalExpenses.toFixed(2)}</td></tr>
      <tr><td>Payments</td><td>$${totalPayments.toFixed(2)}</td></tr>
      <tr><td><strong>Total Amount</strong></td><td><strong>$${(totalPayments + totalExpenses).toFixed(2)}</strong></td></tr>
    `;
  } catch (err) {
    document.getElementById("stats-error").innerHTML = "<p style='color: orange;'>⚠️ Error loading statistics</p>";
    console.error(err);
  }
}

fetchStats();
