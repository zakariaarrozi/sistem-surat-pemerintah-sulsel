const express = require("express");
const router = express.Router();

const {
  getAllSurat,
  createSurat,
  getSuratById,
  updateSurat,
  deleteSurat,
  updateStatusSurat,
  bulkDeleteSurat,
} = require("../controllers/suratController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const upload = require("../config/upload");
const uploadErrorMiddleware = require("../middleware/uploadErrorMiddleware");

const handleUpload = uploadErrorMiddleware(upload);

// GET — Operator dan Admin boleh melihat
router.get("/", authenticateToken, getAllSurat);

// POST — Operator dan User Instansi boleh membuat surat
router.post(
  "/",
  authenticateToken,
  authorizeRoles("OPERATOR", "USER_INSTANSI"),
  handleUpload,
  createSurat
);

// GET DETAIL — Operator dan Admin boleh melihat
router.get(
  "/:id",
  authenticateToken,
  getSuratById
);

// PUT — Operator dan User Instansi
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("OPERATOR", "USER_INSTANSI"),
  handleUpload,
  updateSurat
);

// DELETE BULK — Operator dan User Instansi
router.delete(
  "/bulk",
  authenticateToken,
  authorizeRoles("OPERATOR", "USER_INSTANSI"),
  bulkDeleteSurat
);

// DELETE — Operator dan User Instansi
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("OPERATOR", "USER_INSTANSI"),
  deleteSurat
);

// PATCH STATUS — Operator, Admin, dan User Instansi sesuai kewenangan
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("OPERATOR", "ADMIN", "USER_INSTANSI"),
  updateStatusSurat
);

module.exports = router;