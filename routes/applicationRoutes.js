const express = require("express");
const router = express.Router();
const { 
  submitApplication, 
  checkApplicationStatus, 
  getDuplicatePassDetails, 
  issueDuplicatePass 
} = require("../controllers/applicationController");
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/auth");

router.post(
  "/submit",
  verifyToken,
  upload.fields([
    { name: "rcFile", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "contractDoc", maxCount: 1 }
  ]),
  submitApplication
);
router.get("/status", verifyToken, checkApplicationStatus);

router.get("/duplicate", getDuplicatePassDetails);           // Get info before OTP
router.post("/duplicate", issueDuplicatePass);               // Submit after OTP

module.exports = router;
