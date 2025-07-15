const Application = require("../models/Application");
const QRCode = require("qrcode");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const { generateQR, generateQRCode } = require("../utils/generateQR");

exports.getAllApplications = async (req, res) => {
  try {
    const filters = {};

    if (req.query.department) {
      filters["department"] = req.query.department;
    }
    if (req.query.passYear) {
      filters["pass.passYear"] = req.query.passYear;
    }
    if (req.query.applicantType) {
      filters["applicantType"] = req.query.applicantType;
    }

    const applications = await Application.find(filters).sort({ createdAt: -1 });

    res.status(200).json({ count: applications.length, data: applications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    application.adminRemarks = remarks || "";
    application.statusUpdatedAt = new Date();
    
    if (status === "APPROVED") {
      const year = new Date().getFullYear();
      const passNumber = `NRP-${Math.floor(100000 + Math.random() * 900000)}`;

      const qrData = `Pass No: ${passNumber}\nVehicle No: ${application.vehicle.registrationNumber}\nName: ${application.name}\nValid Till: 31/12/${year}`;
      const qrCodeDataUrl = await generateQRCode(qrData);

      application.pass = {
        passNumber,
        passYear: year,
        validTill: new Date(`${year}-12-31`),
        qrCodeDataUrl: qrCodeDataUrl,
      };
    }

    await application.save();

    res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully`,
      application,
    });
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ message: "Failed to update application" });
  }
};

exports.getApplicationDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const docs = {
      rc: application.documents?.rc,
      idProof: application.documents?.idProof,
      contractCopy: application.documents?.contractCopy
    };

    res.status(200).json({
      message: "Documents fetched successfully",
      documents: docs
    });
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      userId,
      name,
      designation,
      department,
      phone,
      email,
      password,
      userType,
      unit,
      office
    } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "User ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId,
      name,
      designation,
      department,
      phone,
      email,
      password: hashedPassword,
      userType,
      unit,
      office
    });

    await newUser.save();

    res.status(201).json({ message: "User account created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.generatePass = async (req, res) => {
  try {
    const { appId } = req.params;

    const application = await Application.findById(appId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const passNumber = `NWR-${Math.floor(100000 + Math.random() * 900000)}`;
    const validTill = new Date();
    validTill.setFullYear(validTill.getFullYear() + 1); // valid for 1 year

    const qrData = {
      passNumber,
      name: application.name || "N/A",
      vehicleNo: application.vehicle?.registrationNumber || "N/A",
      validTill: validTill.toDateString()
    };

    const qrCodeDataUrl = await generateQRCode(JSON.stringify(qrData));

    // Update the application with pass details
    application.status = "APPROVED";
    application.pass = {
      passNumber,
      validTill,
      qrCodeDataUrl
    };

    await application.save();

    res.status(201).json({
      message: "Vehicle pass generated successfully",
      pass: {
        passNumber,
        validTill,
        qrCodeDataUrl,
        application: application._id
      }
    });
  } catch (err) {
    console.error("Error generating pass:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.searchApplications = async (req, res) => {
  try {
    const {
      name,
      department,
      status,
      vehicleNumber,
      year,
      applicantType,
      mobileNumber,
      mobile,
      railwayNo,
      vehicleType
    } = req.query;

    const query = {};

    if (name) query["name"] = new RegExp(name, "i");
    if (department) query["department"] = department;
    if (status) query.status = status;
    if (vehicleNumber) query["vehicle.registrationNumber"] = new RegExp(vehicleNumber, "i");
    if (applicantType) query["applicantType"] = applicantType;
    if (mobileNumber || mobile) query["phone"] = mobileNumber || mobile;
    if (railwayNo) query["railwayNumber"] = railwayNo;
    if (vehicleType) query["vehicle.type"] = vehicleType;

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      query.createdAt = { $gte: start, $lte: end };
    }

    const results = await Application.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      total: results.length,
      data: results,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { appId, id } = req.params; // Support both parameter names
    const applicationId = appId || id;
    
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const passNumber = `NRP-${Date.now().toString().slice(-6)}`;
    const issuedDate = new Date();
    const validUntil = new Date(issuedDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1); // valid for 1 year

    const qrText = `Pass: ${passNumber}\nVehicle: ${application.vehicle.registrationNumber}\nName: ${application.name}\nValid Till: ${moment(validUntil).format("DD/MM/YYYY")}`;
    console.log('Generating QR for:', qrText);
    
    let qrCodeData = null;
    try {
      qrCodeData = await generateQRCode(qrText);
      console.log('QR Code generated successfully, length:', qrCodeData ? qrCodeData.length : 'null');
    } catch (qrError) {
      console.error('QR Code generation failed:', qrError);
    }

    application.status = "APPROVED";
    application.pass = {
      passNumber,
      issuedDate,
      validUntil,
      qrCodeDataUrl: qrCodeData,
    };

    await application.save();

    res.status(200).json({
      message: "Application approved and pass generated",
      passNumber,
      pass: application.pass,
      qrCodeData: qrCodeData,
      qrText: qrText
    });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Approval failed" });
  }
};

exports.printVehiclePass = async (req, res) => {
  const { id } = req.params;

  try {
    const application = await Application.findById(id);
    if (!application || application.status !== "APPROVED") {
      return res.status(404).json({ message: "Approved application not found" });
    }

    const pass = application.pass;
    const applicant = {
      name: application.name,
      designation: application.designation,
      mobile: application.phone
    };
    const vehicle = application.vehicle;

    // Simple HTML template
    const html = `
      <html>
      <head>
        <title>Vehicle Pass</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; width: 400px; }
          h2 { text-align: center; }
          img { width: 120px; display: block; margin: 10px auto; }
          table { width: 100%; margin-top: 10px; border-collapse: collapse; }
          td { padding: 6px; border-bottom: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <h2>Indian Railways - NWR<br/>Vehicle Parking Pass</h2>
        <img src="${pass.qrCodeDataUrl}" alt="QR Code"/>
        <table>
          <tr><td><b>Pass Number</b></td><td>${pass.passNumber}</td></tr>
          <tr><td><b>Name</b></td><td>${applicant.name}</td></tr>
          <tr><td><b>Designation</b></td><td>${applicant.designation}</td></tr>
          <tr><td><b>Mobile</b></td><td>${applicant.mobile}</td></tr>
          <tr><td><b>Vehicle No</b></td><td>${vehicle.registrationNumber}</td></tr>
          <tr><td><b>Vehicle Type</b></td><td>${vehicle.type}</td></tr>
          <tr><td><b>Valid Till</b></td><td>${new Date(pass.validTill).toLocaleDateString()}</td></tr>
        </table>
        <p style="text-align:right; margin-top: 20px;">Authorized Signatory</p>
      </body>
      </html>
    `;

    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error("Print pass error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
