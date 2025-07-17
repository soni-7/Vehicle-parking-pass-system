/**
 * NR Vehicle Pass Backend API
 * 
 * This is the main entry point for the NR (Northern Railway) Vehicle Pass Backend API.
 * The system manages vehicle pass applications for railway employees and contractors,
 * including application submission, verification, approval, and pass generation.
 * 
 * Features:
 * - User authentication and authorization
 * - Vehicle pass application management
 * - Admin panel for application review
 * - OTP verification system
 * - Document upload handling
 * - QR code generation for approved passes
 * 
 * @author Vehicle Pass System Team
 * @version 1.0.0
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Import route modules
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const otpRoutes = require("./routes/otpRoutes");
const passRoutes = require("./routes/passRoutes");
const userRoutes = require("./routes/userRouters");

// Load environment variables from .env file
dotenv.config();

// Establish database connection
connectDB();

// Initialize Express application
const app = express();

// Middleware configuration
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend integration
app.use(express.json()); // Parse JSON request bodies
app.use("/uploads", express.static("uploads")); // Serve uploaded files (documents, images) statically

// API route configuration
app.use("/api/auth", authRoutes); // Authentication routes (login, register, password reset)
app.use("/api/application", applicationRoutes); // Vehicle pass application routes
app.use("/api/admin", adminRoutes); // Admin panel routes (approve/reject applications)
app.use("/api/otp", otpRoutes); // OTP verification routes
app.use("/api/pass", passRoutes); // Pass management routes
app.use("/api/user", userRoutes); // User profile routes

// Health check endpoints
// Root endpoint - confirms API is running
app.get("/", (req, res) => {
  res.json({
    message: "NR Vehicle Pass Backend API is running!",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

// Detailed health check endpoint for monitoring
app.get("/api/health", (req, res) => {
  res.json({
    message: "API Health Check",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
