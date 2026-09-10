const express = require("express");
const { getAllUsers, deleteUser, resetPassword } = require("../controllers/userController");

const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Hanya SUPERADMIN yang bisa melihat daftar user
router.get("/", authenticateToken, authorizeRoles("SUPERADMIN"), getAllUsers);

// Hanya SUPERADMIN yang bisa menghapus user
router.delete("/:id", authenticateToken, authorizeRoles("SUPERADMIN"), deleteUser);

// Hanya SUPERADMIN yang bisa mereset password
router.post("/:id/reset-password", authenticateToken, authorizeRoles("SUPERADMIN"), resetPassword);

module.exports = router;
