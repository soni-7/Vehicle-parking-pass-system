const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc Register New User (Admin Only)
exports.registerUser = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      password,
      userType,
      designation,
      department,
      unit,
      office,
      phone,
    } = req.body;

    const existingUser = await User.findOne({ userId });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      userType,
      designation,
      department,
      unit,
      office,
      phone,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Login User
exports.loginUser = async (req, res) => {
  try {
    console.log("REQ.BODY ===>", req.body);
    const userId = req.body.userId;
    const password = req.body.password;

    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.userId, userType: user.userType },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({ token, userType: user.userType, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login Failed" });
  }
};
