const mongoose = require("mongoose");

const passSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
  passNumber: { type: String, required: true, unique: true },
  validTill: { type: Date, required: true },
  qrCodePath: { type: String },
  createdAt: { type: Date, default: Date.now },
  qrCode: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("Pass", passSchema);
