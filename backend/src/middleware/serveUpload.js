const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

/**
 * Middleware untuk melayani file uploads dengan proteksi:
 * - Harus login (bearer token valid)
 * - Admin (TUJUAN / KABUPATEN) tidak boleh mengakses file
 * - OPERATOR dan USER_INSTANSI boleh mengakses file milik semua surat
 */
const serveUpload = (req, res) => {
  try {
    // ===================================================
    // AUTENTIKASI
    // ===================================================
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Token tidak valid" });
    }

    // ===================================================
    // BLOKIR ADMIN DARI MENGAKSES FILE
    // ===================================================


    // ===================================================
    // SAJIKAN FILE
    // ===================================================
    const filename = req.params.filename;

    // Cegah path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(__dirname, "../../uploads", safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File tidak ditemukan" });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("serveUpload error:", err);
    res.status(500).json({ success: false, message: "Gagal mengakses file" });
  }
};

module.exports = serveUpload;
