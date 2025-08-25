const express = require("express");
const router = express.Router();
const User = require("../models/User");
const ExpenseModel = require('../models/Expense');
const authenticateUser = require("../middleware/authMiddleware");


router.post("/set-balance", authenticateUser, async (req, res) => {
  const { balance } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const incomeAmount = parseFloat(balance);

    const income = {
      amount: incomeAmount,
      source: "Manual admin top-up",
      date: new Date().toISOString().split("T")[0],
    };

    if (!user.incomes) user.incomes = [];
    user.incomes.push(income);

    user.balance = incomeAmount;
    await user.save();

    res.status(200).json({ message: "Balance and income updated", balance: user.balance });
  } catch (err) {
    console.error("Set balance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add-expense", authenticateUser, async (req, res) => {
  const { amount, description, date } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const expense = {
      amount: parseFloat(amount),
      description,
      date,
    };

    user.expenses.push(expense);
    user.balance -= expense.amount;
    await user.save();

    await ExpenseModel.create({ userId: user._id, amount: parseFloat(amount), description, date });

    res.status(200).json({ message: "Expense added successfully", balance: user.balance });
  } catch (err) {
    console.error("Add expense error:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
});

router.get("/user", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      name: user.name,
      balance: user.balance,
    });
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/delete-expense", authenticateUser, async (req, res) => {
  const { index } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user || index < 0 || index >= user.expenses.length) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const removed = user.expenses.splice(index, 1)[0];
    user.balance += removed.amount;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Delete expense error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/statistics", authenticateUser, async (req, res) => {
  const { period } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const now = new Date();
    let start;

    switch (period) {
      case "daily":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid period" });
    }

    const filterByDate = (list) => list.filter((item) => new Date(item.date) >= start);

    const expenses = filterByDate(user.expenses || []);
    const payments = filterByDate(user.payments || []);
    const incomes = filterByDate(user.incomes || []);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);

    res.status(200).json({
      success: true,
      expenses,
      payments,
      incomes,
      totalExpenses,
      totalPayments,
      totalIncomes,
    });
  } catch (err) {
    console.error("Statistics error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
