const express = require("express");
const router = express.Router();
const { 
  getAllApplications, 
  updateApplicationStatus, 
  getApplicationDocuments,
  generatePass,
  searchApplications,
  approveApplication
} = require("../controllers/adminController");

// Protect these routes using middleware if needed (auth, role check)
router.get("/applications", getAllApplications);
router.put("/applications/:id/status", updateApplicationStatus);
router.get("/applications/:id/documents", getApplicationDocuments);
router.post("/generate-pass/:appId", generatePass);
router.get("/applications/search", searchApplications);
router.post("/applications/:appId/approve", approveApplication);

module.exports = router;
