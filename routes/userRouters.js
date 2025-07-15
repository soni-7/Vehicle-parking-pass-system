const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

router.put("/update-profile", verifyToken, userController.updateProfile);
router.put("/change-password", verifyToken, userController.changePassword);

module.exports = router;
