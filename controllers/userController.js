const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Update Profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, designation, mobile, email } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { name, designation, mobile, email });
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
