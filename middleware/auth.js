const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7) 
    : authHeader;
    
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // userId and userType
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.userType !== "ADMIN") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};
