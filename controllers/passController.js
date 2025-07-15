const Application = require("../models/Application");
const Otp = require("../models/OTP");
const sendEmailOTP = require("../utils/sendEmailOTP");
const generateQRCode = require("../utils/generateQR");

exports.getPass = async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await Application.findById(appId);

    if (!app || app.status !== "APPROVED")
      return res.status(404).json({ message: "No approved pass found" });

    res.status(200).json({
      name: app.name,
      vehicle: app.vehicle.registrationNumber,
      validUntil: app.pass?.validUntil,
      passNumber: app.pass?.passNumber,
      qrCode: app.pass?.qrCodeDataUrl,
    });
  } catch (err) {
    console.error("Get pass error:", err);
    res.status(500).json({ message: "Failed to get pass" });
  }
};

exports.requestDuplicatePass = async (req, res) => {
  const { applicationNumber } = req.body;

  try {
    const app = await Application.findOne({ applicationNumber });

    if (!app || app.status !== "APPROVED") {
      return res.status(404).json({ message: "Approved pass not found" });
    }

    const email = app.otpEmail || app.email;

    // Generate and send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email }); // clear old OTPs
    await new Otp({ email, otp: otpCode }).save();

    await sendEmailOTP(email, otpCode);

    res.status(200).json({ message: "OTP sent to your registered Email", applicationId: app._id });
  } catch (err) {
    console.error("Duplicate pass request failed:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.approvePass = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminRemarks, validTill } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status === "APPROVED") {
      return res.status(400).json({ message: "Application already approved" });
    }

    // Generate pass number
    const currentYear = new Date().getFullYear();
    const passNumber = `NRP-${currentYear}-${Date.now().toString().slice(-6)}`;

    // Generate QR code data
    const qrData = {
      passNumber: passNumber,
      name: application.name,
      vehicleNumber: application.vehicle.registrationNumber,
      validUntil: validTill,
      applicationNumber: application.applicationNumber
    };

    const qrCodeDataUrl = await generateQRCode(qrData, `pass-${applicationId}`);

    // Update application with pass details
    application.status = "APPROVED";
    application.adminRemarks = adminRemarks;
    application.statusUpdatedAt = new Date();
    application.pass = {
      passNumber: passNumber,
      passYear: currentYear,
      validTill: new Date(validTill),
      validUntil: new Date(validTill),
      qrCodeDataUrl: qrCodeDataUrl,
      issuedDate: new Date()
    };

    await application.save();

    res.status(200).json({ 
      message: "Pass approved successfully", 
      passNumber: passNumber,
      application: application 
    });
  } catch (err) {
    console.error("Pass approval error:", err);
    res.status(500).json({ message: "Failed to approve pass" });
  }
};

exports.rejectPass = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminRemarks } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "REJECTED";
    application.adminRemarks = adminRemarks;
    application.statusUpdatedAt = new Date();

    await application.save();

    res.status(200).json({ 
      message: "Pass rejected", 
      application: application 
    });
  } catch (err) {
    console.error("Pass rejection error:", err);
    res.status(500).json({ message: "Failed to reject pass" });
  }
};
