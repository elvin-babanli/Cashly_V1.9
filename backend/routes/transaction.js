const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const User = require('../models/User');


router.post('/get-expenses', async (req, res) => {
  const { userId } = req.body;
  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

router.post('/get-payments', async (req, res) => {
  const { userId } = req.body;
  try {
    const payments = await Payment.find({ userId }).sort({ date: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

router.delete('/delete-expense', async (req, res) => {
  const { id, userId } = req.body;
  try {
    await Expense.findOneAndDelete({ _id: id, userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting expense' });
  }
});

router.delete('/delete-payment', async (req, res) => {
  const { id, userId } = req.body;
  try {
    await Payment.findOneAndDelete({ _id: id, userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting payment' });
  }
});

router.post("/make-payment", async (req, res) => {
  const { userId, method, description, amount, date } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const payment = {
      method,
      description,
      amount: parseFloat(amount),
      date,
    };

    if (!user.payments) user.payments = [];
    user.payments.push(payment);
    user.balance -= payment.amount;
    await user.save();

    const PaymentModel = require('../models/Payment');
    await PaymentModel.create({ userId: user._id, method, description, amount: parseFloat(amount), date });

    res.status(200).json({ message: "Payment successful", balance: user.balance });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
