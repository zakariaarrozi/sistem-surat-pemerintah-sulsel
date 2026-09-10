const prisma = require("../config/prisma");

// GET ALL
const getAllAsalSurat = async (req, res) => {
  try {
    const asalSurat = await prisma.asalSurat.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ success: true, message: "Data asal surat berhasil diambil", data: asalSurat });
  } catch (error) {
    console.error("Get asal surat error:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data asal surat" });
  }
};

// CREATE
const createAsalSurat = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama || !nama.trim()) {
      return res.status(400).json({ success: false, message: "Nama asal surat wajib diisi" });
    }

    const existing = await prisma.asalSurat.findUnique({ where: { nama: nama.trim() } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Nama asal surat sudah ada" });
    }

    const asalSurat = await prisma.asalSurat.create({ data: { nama: nama.trim() } });
    res.status(201).json({ success: true, message: "Asal surat berhasil ditambahkan", data: asalSurat });
  } catch (error) {
    console.error("Create asal surat error:", error);
    res.status(500).json({ success: false, message: "Gagal menambahkan asal surat" });
  }
};

// UPDATE
const updateAsalSurat = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const { nama, aktif } = req.body;
    if (!nama || !nama.trim()) {
      return res.status(400).json({ success: false, message: "Nama asal surat wajib diisi" });
    }

    const existing = await prisma.asalSurat.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Asal surat tidak ditemukan" });
    }

    const duplicate = await prisma.asalSurat.findFirst({
      where: { nama: nama.trim(), NOT: { id } },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Nama asal surat sudah ada" });
    }

    const asalSurat = await prisma.asalSurat.update({
      where: { id },
      data: { nama: nama.trim(), aktif: aktif !== undefined ? Boolean(aktif) : existing.aktif },
    });
    res.json({ success: true, message: "Asal surat berhasil diperbarui", data: asalSurat });
  } catch (error) {
    console.error("Update asal surat error:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui asal surat" });
  }
};

// DELETE
const deleteAsalSurat = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const existing = await prisma.asalSurat.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Asal surat tidak ditemukan" });
    }

    const used = await prisma.surat.findFirst({ where: { asalSuratId: id } });
    if (used) {
      return res.status(400).json({
        success: false,
        message: "Asal surat tidak dapat dihapus karena masih digunakan oleh surat",
      });
    }

    await prisma.asalSurat.delete({ where: { id } });
    res.json({ success: true, message: "Asal surat berhasil dihapus" });
  } catch (error) {
    console.error("Delete asal surat error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus asal surat" });
  }
};

// TOGGLE AKTIF
const toggleAsalSurat = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const existing = await prisma.asalSurat.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Asal surat tidak ditemukan" });
    }

    const asalSurat = await prisma.asalSurat.update({
      where: { id },
      data: { aktif: !existing.aktif },
    });
    res.json({
      success: true,
      message: `Asal surat berhasil ${asalSurat.aktif ? "diaktifkan" : "dinonaktifkan"}`,
      data: asalSurat,
    });
  } catch (error) {
    console.error("Toggle asal surat error:", error);
    res.status(500).json({ success: false, message: "Gagal mengubah status asal surat" });
  }
};

module.exports = { getAllAsalSurat, createAsalSurat, updateAsalSurat, deleteAsalSurat, toggleAsalSurat };
