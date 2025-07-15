// Simple test controller without model dependencies
exports.generateOtp = async (req, res) => {
  res.json({ message: "Test OTP generation" });
};

exports.verifyOtp = async (req, res) => {
  res.json({ message: "Test OTP verification" });
};

exports.sendOtp = async (req, res) => {
  res.json({ message: "Test OTP send" });
};

exports.verifyOtpForDuplicate = async (req, res) => {
  res.json({ message: "Test duplicate verification" });
};
