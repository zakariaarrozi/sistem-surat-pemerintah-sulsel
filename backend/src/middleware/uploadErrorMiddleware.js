const multer = require("multer");
const fs = require("fs");

const uploadErrorMiddleware = (upload) => {
  return (req, res, next) => {
    upload.array("files", 10)(req, res, (err) => {
      if (!err) {
        return next();
      }

      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (error) {
            console.error(
              "Gagal menghapus file upload:",
              error
            );
          }
        });
      }

      if (
        err instanceof multer.MulterError &&
        err.code === "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message: "Ukuran file maksimal 100 MB",
        });
      }

      if (
        err.message ===
        "File harus berupa PDF, DOC, atau DOCX"
      ) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message:
            "Terjadi kesalahan saat upload file",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          err.message ||
          "Terjadi kesalahan saat upload file",
      });
    });
  };
};

module.exports = uploadErrorMiddleware;