const express = require("express");
const {
  getAllAsalSurat,
  createAsalSurat,
  updateAsalSurat,
  deleteAsalSurat,
  toggleAsalSurat,
} = require("../controllers/asalSuratController");

const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// GET — semua user bisa melihat
router.get("/", authenticateToken, getAllAsalSurat);

// Hanya ADMIN yang bisa kelola master data
router.post("/", authenticateToken, authorizeRoles("SUPERADMIN"), createAsalSurat);
router.put("/:id", authenticateToken, authorizeRoles("SUPERADMIN"), updateAsalSurat);
router.delete("/:id", authenticateToken, authorizeRoles("SUPERADMIN"), deleteAsalSurat);
router.patch("/:id/toggle", authenticateToken, authorizeRoles("SUPERADMIN"), toggleAsalSurat);

module.exports = router;
