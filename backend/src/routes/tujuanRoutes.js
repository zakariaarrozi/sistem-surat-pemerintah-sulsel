const express = require("express");
const {
  getAllTujuan,
  createTujuan,
  updateTujuan,
  deleteTujuan,
  toggleTujuan,
} = require("../controllers/tujuanController");

const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// GET — semua user bisa melihat
router.get("/", authenticateToken, getAllTujuan);

// Hanya SUPERADMIN yang bisa kelola master data
router.post("/", authenticateToken, authorizeRoles("SUPERADMIN"), createTujuan);
router.put("/:id", authenticateToken, authorizeRoles("SUPERADMIN"), updateTujuan);
router.delete("/:id", authenticateToken, authorizeRoles("SUPERADMIN"), deleteTujuan);
router.patch("/:id/toggle", authenticateToken, authorizeRoles("SUPERADMIN"), toggleTujuan);

module.exports = router;
