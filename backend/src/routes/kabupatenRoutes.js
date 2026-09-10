const express = require("express");
const {
  getAllKabupaten,
  createKabupaten,
  updateKabupaten,
  deleteKabupaten,
  toggleKabupaten,
} = require("../controllers/kabupatenController");

const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// GET — semua user bisa melihat
router.get("/", authenticateToken, getAllKabupaten);

// Hanya SUPERADMIN yang bisa kelola master data
router.post("/", authenticateToken, authorizeRoles("SUPERADMIN"), createKabupaten);
router.put("/:id", authenticateToken, authorizeRoles("SUPERADMIN"), updateKabupaten);
router.delete("/:id", authenticateToken, authorizeRoles("SUPERADMIN"), deleteKabupaten);
router.patch("/:id/toggle", authenticateToken, authorizeRoles("SUPERADMIN"), toggleKabupaten);

module.exports = router;