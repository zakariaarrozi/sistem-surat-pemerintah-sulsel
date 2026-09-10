require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const tujuanRoutes = require("./routes/tujuanRoutes");
const kabupatenRoutes = require("./routes/kabupatenRoutes");
const suratRoutes = require("./routes/suratRoutes");
const authRoutes = require("./routes/authRoutes");
const asalSuratRoutes = require("./routes/asalSuratRoutes");
const userRoutes = require("./routes/userRoutes");
const serveUpload = require("./middleware/serveUpload");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

// Serve file upload dengan proteksi autentikasi (Admin tidak bisa akses)
app.get("/uploads/:filename", serveUpload);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Sistem Surat Sulawesi Selatan berjalan",
  });
});

app.use("/api/tujuan", tujuanRoutes);
app.use("/api/kabupaten", kabupatenRoutes);
app.use("/api/surat", suratRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/asal-surat", asalSuratRoutes);
app.use("/api/users", userRoutes);



app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
