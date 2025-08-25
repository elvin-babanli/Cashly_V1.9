const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const addRoutes = require("./routes/add");
const transactionRoutes = require("./routes/transaction");

app.use("/api", authRoutes);
app.use("/api", addRoutes);
app.use("/api", transactionRoutes);

app.get("/", (req, res) => {
  res.send("✅ Cashly server is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
