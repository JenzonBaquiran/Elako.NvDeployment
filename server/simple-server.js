require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 1337;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Elako.Nv Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    timestamp: new Date().toISOString()
  });
});

// MongoDB Connection (non-blocking)
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ElakoNv";
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("⚠️  Server will continue without database");
  }
}

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

// Start server first, then connect to database
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  connectDB(); // Connect to database after server starts
});

module.exports = app;