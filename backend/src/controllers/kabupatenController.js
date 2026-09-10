const prisma = require("../config/prisma");

// GET ALL
const getAllKabupaten = async (req, res) => {
  try {
    const kabupaten = await prisma.kabupaten.findMany({
      orderBy: { nama: "asc" },
    });
    res.json({ success: true, message: "Data kabupaten/kota berhasil diambil", data: kabupaten });
  } catch (error) {
    console.error("Get kabupaten error:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data kabupaten/kota" });
  }
};

// CREATE
const createKabupaten = async (req, res) => {
  try {
    const { nama, tipe } = req.body;
    if (!nama || !nama.trim()) {
      return res.status(400).json({ success: false, message: "Nama kabupaten/kota wajib diisi" });
    }
    if (!tipe || !tipe.trim()) {
      return res.status(400).json({ success: false, message: "Tipe wajib diisi (Kabupaten/Kota)" });
    }

    const existing = await prisma.kabupaten.findUnique({ where: { nama: nama.trim() } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Nama kabupaten/kota sudah ada" });
    }

    const kabupaten = await prisma.kabupaten.create({ data: { nama: nama.trim(), tipe: tipe.trim() } });
    res.status(201).json({ success: true, message: "Kabupaten/kota berhasil ditambahkan", data: kabupaten });
  } catch (error) {
    console.error("Create kabupaten error:", error);
    res.status(500).json({ success: false, message: "Gagal menambahkan kabupaten/kota" });
  }
};

// UPDATE
const updateKabupaten = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const { nama, tipe, aktif } = req.body;
    if (!nama || !nama.trim()) {
      return res.status(400).json({ success: false, message: "Nama kabupaten/kota wajib diisi" });
    }
    if (!tipe || !tipe.trim()) {
      return res.status(400).json({ success: false, message: "Tipe wajib diisi" });
    }

    const existing = await prisma.kabupaten.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Kabupaten/kota tidak ditemukan" });
    }

    const duplicate = await prisma.kabupaten.findFirst({
      where: { nama: nama.trim(), NOT: { id } },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Nama kabupaten/kota sudah ada" });
    }

    const kabupaten = await prisma.kabupaten.update({
      where: { id },
      data: {
        nama: nama.trim(),
        tipe: tipe.trim(),
        aktif: aktif !== undefined ? Boolean(aktif) : existing.aktif,
      },
    });
    res.json({ success: true, message: "Kabupaten/kota berhasil diperbarui", data: kabupaten });
  } catch (error) {
    console.error("Update kabupaten error:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui kabupaten/kota" });
  }
};

// DELETE
const deleteKabupaten = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const existing = await prisma.kabupaten.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Kabupaten/kota tidak ditemukan" });
    }

    const used = await prisma.suratKabupaten.findFirst({ where: { kabupatenId: id } });
    if (used) {
      return res.status(400).json({
        success: false,
        message: "Kabupaten/kota tidak dapat dihapus karena masih digunakan oleh surat",
      });
    }

    await prisma.kabupaten.delete({ where: { id } });
    res.json({ success: true, message: "Kabupaten/kota berhasil dihapus" });
  } catch (error) {
    console.error("Delete kabupaten error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus kabupaten/kota" });
  }
};

// TOGGLE AKTIF
const toggleKabupaten = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const existing = await prisma.kabupaten.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Kabupaten/kota tidak ditemukan" });
    }

    const kabupaten = await prisma.kabupaten.update({
      where: { id },
      data: { aktif: !existing.aktif },
    });
    res.json({
      success: true,
      message: `Kabupaten/kota berhasil ${kabupaten.aktif ? "diaktifkan" : "dinonaktifkan"}`,
      data: kabupaten,
    });
  } catch (error) {
    console.error("Toggle kabupaten error:", error);
    res.status(500).json({ success: false, message: "Gagal mengubah status kabupaten/kota" });
  }
};

module.exports = { getAllKabupaten, createKabupaten, updateKabupaten, deleteKabupaten, toggleKabupaten };