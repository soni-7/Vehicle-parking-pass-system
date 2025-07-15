exports.generateOtp = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const Otp = require("../models/OTP");
    const sendEmailOTP = require("../utils/sendEmailOTP");
    
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(200).json({ 
        message: "OTP generated successfully (Email not configured - check console for OTP)",
        otp: otpCode,
        note: "Configure EMAIL_USER and EMAIL_PASS in .env file to send actual emails"
      });
    }
    
    await Otp.deleteMany({ email });
    const otpEntry = new Otp({ email, otp: otpCode });
    await otpEntry.save();

    await sendEmailOTP(email, otpCode);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error generating OTP:", err);
    
    // If email sending fails, still save OTP and return success with fallback
    if (err.message.includes("Failed to send OTP email")) {
      try {
        await Otp.deleteMany({ email });
        const otpEntry = new Otp({ email, otp: otpCode });
        await otpEntry.save();
        
        res.status(200).json({ 
          message: "OTP generated (Email sending failed - check console for OTP)",
          otp: otpCode,
          note: "Configure EMAIL_USER and EMAIL_PASS in .env file to send emails"
        });
      } catch (dbErr) {
        res.status(500).json({ message: "Failed to generate OTP" });
      }
    } else {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const Otp = require("../models/OTP");
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await Otp.deleteMany({ email });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

exports.verifyOtpForDuplicate = async (req, res) => {
  const { applicationId, otp } = req.body;

  try {
    const Application = require("../models/Application");
    const Otp = require("../models/OTP");
    
    const app = await Application.findById(applicationId);
    if (!app || app.status !== "APPROVED")
      return res.status(404).json({ message: "Approved pass not found" });

    const record = await Otp.findOne({ email: app.otpEmail, otp });

    if (!record) {
      return res.status(400).json({ message: "OTP expired or incorrect" });
    }

    await Otp.deleteMany({ email: app.otpEmail });

    res.status(200).json({
      message: "OTP Verified",
      pass: {
        name: app.name,
        vehicle: app.vehicle.registrationNumber,
        validUpto: app.pass?.validUpto,
        passNumber: app.pass?.passNumber,
        qrCode: app.pass?.qrCodeDataUrl,
      },
    });
  } catch (err) {
    console.error("OTP verification failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const Otp = require("../models/OTP");
    const sendEmailOTP = require("../utils/sendEmailOTP");
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await new Otp({ email, otp: otpCode }).save();
    await sendEmailOTP(email, otpCode);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

