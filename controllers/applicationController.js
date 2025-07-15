const Application = require("../models/Application");
const VehiclePass = require("../models/VehiclePass");
const { generateQR, generateQRCode } = require("../utils/generateQR");

exports.submitApplication = async (req, res) => {
  try {
    const {
      applicantType, employeeId, name, designation, department, unit,
      office, phone, railwayNumber, email, otpEmail, sex,
      vehicleType, registrationNumber, ownerName, ownerNameRC,
      ownershipType, contractExpiry, makeModel, color
    } = req.body;

    // Validate required fields
    if (!name || !vehicleType || !registrationNumber) {
      return res.status(400).json({ 
        message: "Name, vehicle type, and registration number are required" 
      });
    }

    const rcFile = req.files['rcFile']?.[0]?.filename;
    const idProof = req.files['idProof']?.[0]?.filename;
    const contractDoc = req.files['contractDoc']?.[0]?.filename;

    const application = new Application({
      userId: req.user.userId,
      applicantType, 
      employeeId, 
      name, 
      designation, 
      department, 
      unit,
      office, 
      phone, 
      railwayNumber, 
      email, 
      otpEmail, 
      sex,
      vehicle: {
        type: vehicleType,
        registrationNumber,
        ownerName,
        ownerNameRC,
        ownershipType,
        contractExpiry,
        makeModel,
        color
      },
      documents: {
        rcFile, 
        idProof, 
        contractDoc
      }
    });

    await application.save();
    
    res.status(201).json({ 
      message: "Application submitted successfully", 
      applicationId: application._id,
      applicationNumber: application.applicationNumber
    });

  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ message: "Error submitting application" });
  }
};

exports.checkApplicationStatus = async (req, res) => {
  const { applicationNumber, applicationId, pfNumber } = req.query;

  if ((!applicationNumber && !applicationId) || !pfNumber) {
    return res.status(400).json({ 
      message: "Application Number (or ID) and PF Number are required" 
    });
  }

  try {
    let query = { railwayNumber: pfNumber };
    
    if (applicationNumber) {
      query.applicationNumber = applicationNumber;
    } else if (applicationId) {
      query._id = applicationId;
    }

    const application = await Application.findOne(query);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      applicationNumber: application.applicationNumber,
      applicationId: application._id,
      status: application.status,
      name: application.name,
      designation: application.designation,
      department: application.department,
      vehicle: {
        regNumber: application.vehicle?.registrationNumber,
        type: application.vehicle?.type
      },
      submittedAt: application.createdAt,
      statusUpdatedAt: application.statusUpdatedAt,
      adminRemarks: application.adminRemarks
    });
  } catch (err) {
    console.error("Error in checkApplicationStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getDuplicatePassDetails = async (req, res) => {
  const { applicationNumber, applicationId } = req.query;

  if (!applicationNumber && !applicationId) {
    return res.status(400).json({ message: "Application Number or ID is required" });
  }

  try {
    let query = { status: "APPROVED" };
    
    if (applicationNumber) {
      query.applicationNumber = applicationNumber;
    } else if (applicationId) {
      query._id = applicationId;
    }

    const application = await Application.findOne(query);

    if (!application) {
      return res.status(404).json({ message: "Approved application not found" });
    }

    res.status(200).json({
      applicationId: application._id,
      applicationNumber: application.applicationNumber,
      name: application.name,
      vehicleNumber: application.vehicle?.registrationNumber,
      email: application.otpEmail || application.email,
      mobile: application.phone,
      validTill: application.pass?.validTill,
      applicationType: "DUPLICATE"
    });
  } catch (err) {
    console.error("Error in getDuplicatePassDetails:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.issueDuplicatePass = async (req, res) => {
  const { applicationId, otp } = req.body;

  try {
    const existingApp = await Application.findOne({ _id: applicationId, status: "APPROVED" });
    if (!existingApp) {
      return res.status(404).json({ message: "Application not found or not approved" });
    }

    const Otp = require("../models/OTP");
    const otpEntry = await Otp.findOne({ email: existingApp.otpEmail, otp });
    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await Otp.deleteMany({ email: existingApp.otpEmail });

    // Optionally mark it or log it as duplicate request
    existingApp.isDuplicateRequested = true;
    await existingApp.save();

    res.status(200).json({
      message: "Duplicate pass request successful",
      passDetails: {
        applicationId: existingApp._id,
        name: existingApp.name,
        vehicle: existingApp.vehicle,
        validTill: existingApp.pass?.validTill,
        qrCode: existingApp.pass?.qrCodeDataUrl
      }
    });
  } catch (err) {
    console.error("Error in issueDuplicatePass:", err);
    res.status(500).json({ message: "Failed to process duplicate pass request" });
  }
};
exports.getDuplicatePassStatus = async (req, res) => {
  const { applicationNumber } = req.query;

  if (!applicationNumber) {
    return res.status(400).json({ message: "Application Number is required" });
  }

  try {
    const application = await Application.findOne({ applicationNumber });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      status: application.status,
      issuedAt: application.issuedAt,
      validTill: application.validTill,
      qrCode: application.qrCode // if stored
    });
  } catch (err) {
    console.error("Error in getDuplicatePassStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const appId = req.params.applicationId;
    const files = req.files;

    const update = {};
    if (files.rcDocument)
      update["documents.rc"] = files.rcDocument[0].path;
    if (files.idProof)
      update["documents.idProof"] = files.idProof[0].path;
    if (files.contractDoc)
      update["documents.contractDoc"] = files.contractDoc[0].path;

    await Application.findByIdAndUpdate(appId, { $set: update });

    res.status(200).json({ message: "Documents uploaded successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Document upload failed" });
  }
};
exports.getPassDetails = async (req, res) => {
  try {
    const appId = req.params.appId;
    const application = await Application.findById(appId);

    if (!application || application.status !== "APPROVED")
      return res.status(404).json({ message: "Pass not available" });

    res.status(200).json({
      passNumber: application.pass.passNumber,
      issuedDate: application.pass.issuedDate,
      validUntil: application.pass.validUntil,
      qrCode: application.pass.qrCodeData,
      applicantName: application.applicantDetails.name,
      vehicleNumber: application.vehicleDetails.registrationNumber,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pass" });
  }
};

exports.duplicatePassRequest = async (req, res) => {
  const { previousApplicationId } = req.body;
  const userId = req.user.id;

  try {
    const oldApp = await Application.findOne({
      _id: previousApplicationId,
      userId,
      status: "APPROVED",
    });

    if (!oldApp) {
      return res.status(404).json({ message: "Approved application not found" });
    }

    // Send previous data for preview
    return res.json({
      message: "Data fetched successfully",
      data: {
        applicantDetails: oldApp.applicantDetails,
        vehicleDetails: oldApp.vehicleDetails,
        emailForOtp: oldApp.emailForOtp,
        mobile: oldApp.applicantDetails.mobile,
      },
    });
  } catch (err) {
    console.error("Duplicate pass fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approvePass = async (req, res) => {
  const { passId } = req.params;

  const pass = await VehiclePass.findById(passId);
  if (!pass) return res.status(404).json({ message: "Pass not found" });

  pass.status = "APPROVED";

  const qrData = {
    passId: pass._id,
    name: pass.name,
    vehicleNumber: pass.vehicleNumber,
    validTill: pass.validTill,
  };

  const qrPath = await generateQRCode(qrData, `pass-${pass._id}`);
  pass.qrCode = qrPath;

  await pass.save();
  res.json({ message: "Pass approved and QR generated", pass });
};
