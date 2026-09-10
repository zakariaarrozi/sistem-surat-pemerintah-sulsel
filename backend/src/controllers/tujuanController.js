const prisma = require("../config/prisma");

// GET ALL
const getAllTujuan = async (req, res) => {
  try {
    const tujuan = await prisma.tujuan.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ success: true, message: "Data tujuan berhasil diambil", data: tujuan });
  } catch (error) {
    console.error("Get tujuan error:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data tujuan" });
  }
};

// CREATE
const createTujuan = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama || !nama.trim()) {
      return res.status(400).json({ success: false, message: "Nama tujuan wajib diisi" });
    }

    const existing = await prisma.tujuan.findUnique({ where: { nama: nama.trim() } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Nama tujuan sudah ada" });
    }

    const tujuan = await prisma.tujuan.create({ data: { nama: nama.trim() } });
    res.status(201).json({ success: true, message: "Tujuan berhasil ditambahkan", data: tujuan });
  } catch (error) {
    console.error("Create tujuan error:", error);
    res.status(500).json({ success: false, message: "Gagal menambahkan tujuan" });
  }
};

// UPDATE
const updateTujuan = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const { nama, aktif } = req.body;
    if (!nama || !nama.trim()) {
      return res.status(400).json({ success: false, message: "Nama tujuan wajib diisi" });
    }

    const existing = await prisma.tujuan.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Tujuan tidak ditemukan" });
    }

    const duplicate = await prisma.tujuan.findFirst({
      where: { nama: nama.trim(), NOT: { id } },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Nama tujuan sudah ada" });
    }

    const tujuan = await prisma.tujuan.update({
      where: { id },
      data: { nama: nama.trim(), aktif: aktif !== undefined ? Boolean(aktif) : existing.aktif },
    });
    res.json({ success: true, message: "Tujuan berhasil diperbarui", data: tujuan });
  } catch (error) {
    console.error("Update tujuan error:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui tujuan" });
  }
};

// DELETE
const deleteTujuan = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const existing = await prisma.tujuan.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Tujuan tidak ditemukan" });
    }

    // Cek apakah masih dipakai surat
    const used = await prisma.suratTujuan.findFirst({ where: { tujuanId: id } });
    if (used) {
      return res.status(400).json({
        success: false,
        message: "Tujuan tidak dapat dihapus karena masih digunakan oleh surat",
      });
    }

    await prisma.tujuan.delete({ where: { id } });
    res.json({ success: true, message: "Tujuan berhasil dihapus" });
  } catch (error) {
    console.error("Delete tujuan error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus tujuan" });
  }
};

// TOGGLE AKTIF
const toggleTujuan = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const existing = await prisma.tujuan.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Tujuan tidak ditemukan" });
    }

    const tujuan = await prisma.tujuan.update({
      where: { id },
      data: { aktif: !existing.aktif },
    });
    res.json({ success: true, message: `Tujuan berhasil ${tujuan.aktif ? "diaktifkan" : "dinonaktifkan"}`, data: tujuan });
  } catch (error) {
    console.error("Toggle tujuan error:", error);
    res.status(500).json({ success: false, message: "Gagal mengubah status tujuan" });
  }
};

module.exports = { getAllTujuan, createTujuan, updateTujuan, deleteTujuan, toggleTujuan };