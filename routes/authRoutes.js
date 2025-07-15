const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middleware/auth");

// Admin-only: Register new user
router.post("/register", verifyToken, isAdmin, registerUser);

// Login
router.post("/login", loginUser);

module.exports = router;
