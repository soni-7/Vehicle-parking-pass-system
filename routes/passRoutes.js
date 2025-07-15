const express = require("express");
const router = express.Router();
const passController = require("../controllers/passController");

// Public routes
router.get("/:appId", passController.getPass);
router.post("/duplicate", passController.requestDuplicatePass);

// Admin routes
router.post("/approve/:applicationId", passController.approvePass);
router.post("/reject/:applicationId", passController.rejectPass);

module.exports = router;
