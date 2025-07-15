const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashedPassword = await bcrypt.hash("adminpass", 10);

  const admin = new User({
    userId: "admin001",
    name: "Super Admin",
    email: "admin@example.com",
    password: hashedPassword,
    userType: "ADMIN",
    designation: "System Admin",
    department: "IT",
    unit: "NWR/HQ",
    office: "HEADQUARTER",
    phone: "9999999999",
  });

  await admin.save();
  console.log("✅ Admin user created");
  mongoose.disconnect();
});
