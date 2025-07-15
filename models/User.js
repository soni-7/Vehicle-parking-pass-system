const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  designation: String,
  department: String,
  unit: String,
  office: String,
  phone: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["ADMIN", "USER", "VERIFIER"], default: "USER" },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" }
});

module.exports = mongoose.model("User", userSchema);
