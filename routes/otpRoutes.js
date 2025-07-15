const express = require("express");
const router = express.Router();
const { generateOtp, verifyOtp, sendOtp, verifyOtpForDuplicate } = require("../controllers/otpController");

// Generate and send OTP
router.post("/generate", generateOtp);
router.post("/send", sendOtp);

// Verify OTP
router.post("/verify", verifyOtp);
router.post("/verify-duplicate", verifyOtpForDuplicate);

module.exports = router;
