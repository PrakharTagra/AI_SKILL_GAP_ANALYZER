require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});
const resumeRoute = require("./routes/resume");
app.use("/api", resumeRoute);
console.log("Resume route loaded:", typeof resumeRoute);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});