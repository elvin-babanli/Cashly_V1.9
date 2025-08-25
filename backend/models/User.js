const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  expenses: [
    {
      amount: Number,
      description: String,
      date: String,
    },
  ],
  payments: [
    {
      method: String,
      description: String,
      amount: Number,
      date: String,
    },
  ],
  incomes: [
    {
      source: String,
      amount: Number,
      date: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
