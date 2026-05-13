const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chat");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "WebStep API is running! 🚀" });
});

module.exports = app;