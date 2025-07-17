const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ userId: "ADMIN001" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const adminUser = new User({
      userId: "ADMIN001",
      name: "System Administrator",
      email: "admin@railways.com",
      password: hashedPassword,
      userType: "ADMIN",
      designation: "System Admin",
      department: "IT",
      unit: "NWR",
      office: "Headquarters",
      phone: "9876543210"
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("Login credentials:");
    console.log("userId: ADMIN001");
    console.log("password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
