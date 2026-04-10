const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 5000;
const dbPath = path.join(__dirname, "db.json");

// Security Middleware
// Limit request size to prevent large payload attacks
app.use(express.json({ limit: "10kb" }));

// Security headers
app.use((req, res, next) => {
  // CORS configuration - restrict to localhost for security
  const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000"];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // Security headers
  res.header("X-Content-Type-Options", "nosniff"); // Prevent MIME sniffing
  res.header("X-Frame-Options", "DENY"); // Clickjacking protection
  res.header("X-XSS-Protection", "1; mode=block"); // XSS protection
  res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains"); // HTTPS enforcement
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request validation middleware - prevent empty bodies
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body cannot be empty." });
    }
  }
  next();
});

// read DB
async function readDb() {
  try {
    const data = await fs.readFile(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return { users: [] };
    }
    throw error;
  }
}

// write DB
async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

// home route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// route modules
const chatbotRoutes = require('./routes/chatbot');
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const supportRoutes = require("./routes/support");
const settingsRoutes = require("./routes/settings");

app.use("/api/chatbot", chatbotRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/settings", settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});