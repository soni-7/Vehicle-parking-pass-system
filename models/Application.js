const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  applicationNumber: { type: String, unique: true },
  applicantType: { type: String, enum: ['PHOD', 'GAZETTED', 'NON-GAZETTED', 'CONTRACTOR'] },
  employeeId: { type: String },
  name: { type: String, required: true },
  designation: { type: String },
  department: { type: String },
  unit: { type: String },
  office: { type: String },
  phone: { type: String },
  railwayNumber: { type: String },
  email: { type: String },
  otpEmail: { type: String },
  sex: { type: String },
  vehicle: {
    type: {
      type: String, // TWO WHEELER, FOUR WHEELER
      required: true
    },
    registrationNumber: { type: String, required: true },
    ownerName: String,
    ownerNameRC: String,
    ownershipType: String,
    contractExpiry: String,
    makeModel: String,
    color: String
  },
  documents: {
    rcFile: String,
    idProof: String,
    contractDoc: String
  },
  status: { type: String, default: "PENDING" }, // PENDING, APPROVED, REJECTED
  adminRemarks: { type: String },
  statusUpdatedAt: { type: Date },
  pass: {
    passNumber: { type: String },
    passYear: { type: Number },
    validTill: { type: Date },
    qrCodeDataUrl: { type: String },
    issuedDate: { type: Date },
    validUntil: { type: Date }
  },
  isDuplicateRequested: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: Date.now }
});

// Generate application number before saving
applicationSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.models.Application.countDocuments();
    this.applicationNumber = `NRP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model("Application", applicationSchema);
