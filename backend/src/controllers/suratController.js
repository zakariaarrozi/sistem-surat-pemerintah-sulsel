const fs = require("fs");
const prisma = require("../config/prisma");

// ======================================================
// HELPER: NORMALISASI ARRAY ID
// ======================================================

const normalizeIds = (value) => {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        value = parsed;
      } else {
        value = [parsed];
      }
    } catch (error) {
      value = [value];
    }
  }

  if (!Array.isArray(value)) {
    value = [value];
  }

  return value
    .map(Number)
    .filter(
      (id) => Number.isInteger(id) && id > 0
    );
};

// ======================================================
// HELPER: HAPUS FILE DENGAN AMAN
// ======================================================

const safeUnlink = (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "Gagal menghapus file:",
      error
    );
  }
};

// ======================================================
// HELPER: AMBIL SCOPE HAK AKSES USER
// ======================================================

const getAccessScope = async (user) => {
  if (!user) {
    return {
      type: "NONE",
    };
  }

  // ====================================================
  // OPERATOR
  // ====================================================

  if (user.role === "OPERATOR") {
    return {
      type: "OPERATOR",
    };
  }

  // ====================================================
  // USER INSTANSI (hanya bisa lihat surat miliknya sendiri)
  // ====================================================

  if (user.role === "USER_INSTANSI") {
    return {
      type: "USER_INSTANSI",
      userId: Number(user.userId),
      instansiId: user.instansiId ? Number(user.instansiId) : null,
    };
  }

  // ====================================================
  // HARUS ADMIN
  // ====================================================

  if (user.role !== "ADMIN") {
    return {
      type: "NONE",
    };
  }


  const adminId = Number(user.userId);

  if (!Number.isInteger(adminId) || adminId <= 0) {
    return {
      type: "NONE",
    };
  }

  // ====================================================
  // ADMIN PIMPINAN / INSTANSI
  // ====================================================

  if (
    user.adminType === "PIMPINAN" ||
    user.adminType === "INSTANSI"
  ) {
    const adminTujuan =
      await prisma.adminTujuan.findMany({
        where: {
          adminId,
        },
        select: {
          tujuanId: true,
        },
      });

    const tujuanIds = adminTujuan.map(
      (item) => item.tujuanId
    );

    if (tujuanIds.length === 0) {
      return {
        type: "NONE",
      };
    }

    return {
      type: "TUJUAN",
      tujuanIds,
    };
  }

  // ====================================================
  // ADMIN KABUPATEN
  // ====================================================

  if (user.adminType === "KABUPATEN") {
    const adminKabupaten =
      await prisma.adminKabupaten.findMany({
        where: {
          adminId,
        },
        select: {
          kabupatenId: true,
        },
      });

    const kabupatenIds =
      adminKabupaten.map(
        (item) => item.kabupatenId
      );

    if (kabupatenIds.length === 0) {
      return {
        type: "NONE",
      };
    }

    return {
      type: "KABUPATEN",
      kabupatenIds,
    };
  }

  return {
    type: "NONE",
  };
};

// ======================================================
// HELPER: CEK HAK AKSES SURAT
// ======================================================

const checkSuratAccess = async (
  user,
  suratId
) => {
  if (!user) {
    return false;
  }

  const id = Number(suratId);

  if (!Number.isInteger(id) || id <= 0) {
    return false;
  }

  const scope = await getAccessScope(user);

  // ====================================================
  // OPERATOR
  // ====================================================

  if (scope.type === "OPERATOR") {
    return true;
  }

  // ====================================================
  // USER INSTANSI — hanya surat yang dibuat sendiri
  // ====================================================

  if (scope.type === "USER_INSTANSI") {
    const surat = await prisma.surat.findFirst({
      where: { id, userId: scope.userId },
    });
    return !!surat;
  }

  // ====================================================
  // ADMIN PIMPINAN / INSTANSI
  // ====================================================

  if (scope.type === "TUJUAN") {
    const aksesTujuan = await prisma.suratTujuan.findFirst({
      where: {
        suratId: id,
        tujuanId: {
          in: scope.tujuanIds,
        },
      },
    });

    const aksesTembusan = await prisma.suratTembusan.findFirst({
      where: {
        suratId: id,
        tujuanId: {
          in: scope.tujuanIds,
        },
      },
    });

    return !!aksesTujuan || !!aksesTembusan;
  }

  // ====================================================
  // ADMIN KABUPATEN
  // ====================================================

  if (scope.type === "KABUPATEN") {
    const akses =
      await prisma.suratKabupaten.findFirst({
        where: {
          suratId: id,
          kabupatenId: {
            in: scope.kabupatenIds,
          },
        },
      });

    return !!akses;
  }

  return false;
};

// ======================================================
// HELPER: FILTER DATA SESUAI HAK AKSES
// ======================================================

const filterSuratByAccess = (
  surat,
  scope
) => {
  // ====================================================
  // OPERATOR
  // ====================================================

  if (scope.type === "OPERATOR") {
    return surat;
  }

  // ====================================================
  // USER INSTANSI — tampilkan semua kabupaten surat mereka
  // ====================================================

  if (scope.type === "USER_INSTANSI") {
    return surat;
  }

  // ====================================================
  // ADMIN TUJUAN
  // ====================================================

  if (scope.type === "TUJUAN") {
    return {
      ...surat,

      tujuanSurat: Array.isArray(
        surat.tujuanSurat
      )
        ? surat.tujuanSurat.filter(
            (item) =>
              scope.tujuanIds.includes(
                item.tujuanId
              )
          )
        : [],

      tembusanSurat: Array.isArray(
        surat.tembusanSurat
      )
        ? surat.tembusanSurat.filter(
            (item) =>
              scope.tujuanIds.includes(
                item.tujuanId
              )
          )
        : [],

      kabupatenSurat: [],
    };
  }

  // ====================================================
  // ADMIN KABUPATEN
  // ====================================================

  if (scope.type === "KABUPATEN") {
    return {
      ...surat,

      kabupatenSurat: Array.isArray(
        surat.kabupatenSurat
      )
        ? surat.kabupatenSurat.filter(
            (item) =>
              scope.kabupatenIds.includes(
                item.kabupatenId
              )
          )
        : [],

      tujuanSurat: [],
      tembusanSurat: [],
    };
  }

  // ====================================================
  // NONE
  // ====================================================

  return {
    ...surat,
    tujuanSurat: [],
    tembusanSurat: [],
    kabupatenSurat: [],
  };
};

// ======================================================
// HELPER: INCLUDE DATA SURAT
// ======================================================

const suratInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },

  asalSurat: true,
  lampiran: true,

  tujuanSurat: {
    include: {
      tujuan: true,
      processedUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },

  tembusanSurat: {
    include: {
      tujuan: true,
      processedUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },

  kabupatenSurat: {
    include: {
      kabupaten: true,
      processedUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

// ======================================================
// CREATE SURAT
// ======================================================

const createSurat = async (
  req,
  res
) => {
  let fileCommitted = false;

  try {
    const {
      nomorSurat,
      tanggalSurat,
      asalSuratId,
      asalSuratLainnya,
      keterangan,
    } = req.body;

    let {
      tujuanIds,
      tembusanIds,
      kabupatenIds,
    } = req.body;

    // ==================================================
    // VALIDASI LOGIN
    // ==================================================

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message:
          "User belum terautentikasi",
      });
    }

    // ==================================================
    // VALIDASI ROLE
    // ==================================================

    if (req.user.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "Admin tidak memiliki akses untuk membuat surat",
      });
    }

    // ==================================================
    // USER_INSTANSI: asal surat otomatis, hanya bisa ke kabupaten
    // ==================================================

    const isInstansiUser = req.user.role === "USER_INSTANSI";

    if (isInstansiUser) {
      if (!req.user.instansiId) {
        return res.status(403).json({ success: false, message: "Akun instansi tidak memiliki data instansi" });
      }
    }

    // ==================================================
    // VALIDASI DATA
    // ==================================================

    if (!nomorSurat) {
      return res.status(400).json({
        success: false,
        message:
          "Nomor surat wajib diisi",
      });
    }

    if (!tanggalSurat) {
      return res.status(400).json({
        success: false,
        message:
          "Tanggal surat wajib diisi",
      });
    }

    // Untuk USER_INSTANSI: skip validasi asalSuratId karena otomatis dari instansi
    if (!isInstansiUser) {
      if (!asalSuratId) {
        return res.status(400).json({
          success: false,
          message: "Asal surat wajib dipilih",
        });
      }

      if (asalSuratId === "LAINNYA" && (!asalSuratLainnya || !asalSuratLainnya.trim())) {
        return res.status(400).json({
          success: false,
          message: "Asal surat lainnya wajib diisi",
        });
      }
    }

    // ==================================================
    // VALIDASI FILE
    // ==================================================

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal satu file surat wajib diunggah",
      });
    }

    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    const parsedTanggal =
      new Date(tanggalSurat);

    if (
      Number.isNaN(
        parsedTanggal.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tanggal surat tidak valid",
      });
    }

    // ==================================================
    // USER
    // ==================================================

    const userId = Number(
      req.user.userId
    );

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(401).json({
        success: false,
        message: "User tidak valid",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "User tidak ditemukan",
      });
    }

    // ==================================================
    // NORMALISASI ID
    // ==================================================

    tujuanIds =
      normalizeIds(tujuanIds);

    tembusanIds =
      normalizeIds(tembusanIds);

    kabupatenIds =
      normalizeIds(kabupatenIds);

    tujuanIds = [
      ...new Set(tujuanIds),
    ];

    tembusanIds = [
      ...new Set(tembusanIds),
    ];

    kabupatenIds = [
      ...new Set(kabupatenIds),
    ];

    // ==================================================
    // VALIDASI TUJUAN
    // ==================================================

    // ==================================================
    // CEK ASAL SURAT
    // ==================================================

    let finalAsalSuratId;

    if (isInstansiUser) {
      // Gunakan instansiId dari JWT secara otomatis
      finalAsalSuratId = Number(req.user.instansiId);
      // USER_INSTANSI tidak boleh punya tujuanIds
      tujuanIds = [];
      tembusanIds = [];
    } else if (asalSuratId === "LAINNYA" && asalSuratLainnya) {
      const existing = await prisma.asalSurat.findFirst({
        where: { nama: asalSuratLainnya.trim() },
      });
      if (existing) {
        finalAsalSuratId = existing.id;
      } else {
        const newAsal = await prisma.asalSurat.create({
          data: { nama: asalSuratLainnya.trim() },
        });
        finalAsalSuratId = newAsal.id;
      }
    } else {
      finalAsalSuratId = Number(asalSuratId);
      const asalSurat = await prisma.asalSurat.findFirst({
        where: { id: finalAsalSuratId, aktif: true },
      });
      if (!asalSurat) {
        return res.status(400).json({ success: false, message: "Asal surat tidak valid" });
      }
    }

    // ==================================================
    // CEK TUJUAN
    // ==================================================

    const tujuan =
      await prisma.tujuan.findMany({
        where: {
          id: {
            in: tujuanIds,
          },
          aktif: true,
        },
      });

    if (
      tujuan.length !==
      tujuanIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Terdapat tujuan surat yang tidak valid",
      });
    }

    // ==================================================
    // CEK TEMBUSAN
    // ==================================================

    if (tembusanIds.length > 0) {
      const tembusan =
        await prisma.tujuan.findMany({
          where: {
            id: {
              in: tembusanIds,
            },
            aktif: true,
          },
        });

      if (
        tembusan.length !==
        tembusanIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Terdapat tembusan yang tidak valid",
        });
      }
    }

    // ==================================================
    // CEK KABUPATEN
    // ==================================================

    if (kabupatenIds.length > 0) {
      const kabupaten =
        await prisma.kabupaten.findMany({
          where: {
            id: {
              in: kabupatenIds,
            },
            aktif: true,
          },
        });

      if (
        kabupaten.length !==
        kabupatenIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Terdapat kabupaten/kota yang tidak valid",
        });
      }
    }

    // ==================================================
    // TRANSACTION
    // ==================================================

    const surat =
      await prisma.$transaction(
        async (tx) => {
          const suratBaru =
            await tx.surat.create({
              data: {
                nomorSurat,

                tanggalSurat:
                  parsedTanggal,

                asalSuratId:
                  finalAsalSuratId,

                keterangan:
                  keterangan || null,

                lampiran: {
                  create: req.files ? req.files.map((file) => ({
                    fileName: file.originalname,
                    filePath: file.path,
                  })) : []
                },

                status: "DRAFT",

                userId,

                tujuanSurat: {
                  create:
                    tujuanIds.map(
                      (tujuanId) => ({
                        tujuanId,
                      })
                    ),
                },

                tembusanSurat: {
                  create:
                    tembusanIds.map(
                      (tujuanId) => ({
                        tujuanId,
                      })
                    ),
                },

                kabupatenSurat: {
                  create:
                    kabupatenIds.map(
                      (kabupatenId) => ({
                        kabupatenId,
                      })
                    ),
                },
              },

              include:
                suratInclude,
            });

          return suratBaru;
        }
      );

    // ==================================================
    // DATABASE + FILE BERHASIL
    // ==================================================

    fileCommitted = true;

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,
      message:
        "Surat berhasil disimpan",
      data: surat,
    });
  } catch (error) {
    console.error(
      "Create surat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan surat",
    });
  } finally {
    // ==================================================
    // CLEANUP FILE JIKA CREATE GAGAL
    // ==================================================

    if (
      !fileCommitted &&
      req.file?.path
    ) {
      safeUnlink(req.file.path);
    }
  }
};

// ======================================================
// GET ALL SURAT
// ======================================================

const getAllSurat = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "User belum terautentikasi",
      });
    }

    const scope =
      await getAccessScope(
        req.user
      );

    let where = {};

    // ==================================================
    // NONE
    // ==================================================

    if (scope.type === "NONE") {
      where = {
        id: -1,
      };
    }

    // ==================================================
    // ADMIN TUJUAN
    // ==================================================

    else if (
      scope.type === "TUJUAN"
    ) {
      where = {
        // Admin hanya bisa melihat surat yang SUDAH TERKIRIM (bukan DRAFT)
        NOT: { status: "DRAFT" },
        OR: [
          {
            tujuanSurat: {
              some: {
                tujuanId: {
                  in: scope.tujuanIds,
                },
              },
            },
          },
          {
            tembusanSurat: {
              some: {
                tujuanId: {
                  in: scope.tujuanIds,
                },
              },
            },
          }
        ]
      };
    }

    // ==================================================
    // ADMIN KABUPATEN
    // ==================================================

    else if (
      scope.type === "KABUPATEN"
    ) {
      where = {
        // Admin hanya bisa melihat surat yang SUDAH TERKIRIM (bukan DRAFT)
        NOT: { status: "DRAFT" },
        kabupatenSurat: {
          some: {
            kabupatenId: {
              in:
                scope.kabupatenIds,
            },
          },
        },
      };
    }

    // ==================================================
    // USER INSTANSI — hanya surat milik sendiri
    // ==================================================

    else if (scope.type === "USER_INSTANSI") {
      where = {
        userId: scope.userId,
      };
    }

    // ==================================================
    // OPERATOR
    // ==================================================

    const surat =
      await prisma.surat.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        include:
          suratInclude,
      });

    // ==================================================
    // FILTER RESPONSE
    // ==================================================

    const suratFiltered =
      surat.map((item) =>
        filterSuratByAccess(
          item,
          scope
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Data surat berhasil diambil",
      data: suratFiltered,
    });
  } catch (error) {
    console.error(
      "Get all surat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil data surat",
    });
  }
};

// ======================================================
// GET SURAT BY ID
// ======================================================

const getSuratById = async (
  req,
  res
) => {
  try {
    const id = Number(
      req.params.id
    );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "ID surat tidak valid",
      });
    }

    // ==================================================
    // CEK AKSES
    // ==================================================

    const hasAccess =
      await checkSuratAccess(
        req.user,
        id
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message:
          "Anda tidak memiliki akses untuk melihat surat ini",
      });
    }

    // ==================================================
    // AMBIL DATA
    // ==================================================

    const surat =
      await prisma.surat.findUnique({
        where: {
          id,
        },

        include:
          suratInclude,
      });

    if (!surat) {
      return res.status(404).json({
        success: false,
        message:
          "Surat tidak ditemukan",
      });
    }

    const scope =
      await getAccessScope(
        req.user
      );

    // ==================================================
    // BLOKIR ADMIN DARI SURAT BERSTATUS DRAFT
    // ==================================================

    if (
      (scope.type === "TUJUAN" || scope.type === "KABUPATEN") &&
      surat.status === "DRAFT"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Surat belum dikirim. Admin hanya dapat melihat surat yang sudah berstatus Terkirim atau lebih.",
      });
    }

    const suratFiltered =
      filterSuratByAccess(
        surat,
        scope
      );

    return res.status(200).json({
      success: true,
      message:
        "Detail surat berhasil diambil",
      data: suratFiltered,
    });
  } catch (error) {
    console.error(
      "Get surat by id error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil detail surat",
    });
  }
};

// ======================================================
// UPDATE SURAT
// ======================================================

const updateSurat = async (
  req,
  res
) => {
  let fileCommitted = false;

  try {
    const id = Number(
      req.params.id
    );

    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "ID surat tidak valid",
      });
    }

    const {
      nomorSurat,
      tanggalSurat,
      asalSuratId,
      asalSuratLainnya,
      keterangan,
    } = req.body;

    let {
      tujuanIds,
      tembusanIds,
      kabupatenIds,
    } = req.body;

    // ==================================================
    // CEK SURAT LAMA
    // ==================================================

    const suratLama =
      await prisma.surat.findUnique({
        where: {
          id,
        },
      });

    if (!suratLama) {
      return res.status(404).json({
        success: false,
        message:
          "Surat tidak ditemukan",
      });
    }

    // ==================================================
    // CEK AKSES
    // ==================================================

    const hasAccess =
      await checkSuratAccess(
        req.user,
        id
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message:
          "Anda tidak memiliki akses untuk mengubah surat ini",
      });
    }

    // ==================================================
    // BLOKIR JIKA BUKAN DRAFT
    // ==================================================

    if (suratLama.status !== "DRAFT") {
      return res.status(403).json({
        success: false,
        message:
          "Surat yang sudah terkirim tidak dapat diubah lagi",
      });
    }

    // ==================================================
    // VALIDASI DATA
    // ==================================================

    if (!nomorSurat) {
      return res.status(400).json({
        success: false,
        message:
          "Nomor surat wajib diisi",
      });
    }

    if (!tanggalSurat) {
      return res.status(400).json({
        success: false,
        message:
          "Tanggal surat wajib diisi",
      });
    }

    if (!asalSuratId) {
      return res.status(400).json({
        success: false,
        message:
          "Asal surat wajib dipilih",
      });
    }

    if (asalSuratId === "LAINNYA" && (!asalSuratLainnya || !asalSuratLainnya.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Asal surat lainnya wajib diisi",
      });
    }

    // ==================================================
    // TANGGAL
    // ==================================================

    const parsedTanggal =
      new Date(tanggalSurat);

    if (
      Number.isNaN(
        parsedTanggal.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tanggal surat tidak valid",
      });
    }

    // ==================================================
    // NORMALISASI
    // ==================================================

    tujuanIds =
      normalizeIds(tujuanIds);

    tembusanIds =
      normalizeIds(tembusanIds);

    kabupatenIds =
      normalizeIds(kabupatenIds);

    tujuanIds = [
      ...new Set(tujuanIds),
    ];

    tembusanIds = [
      ...new Set(tembusanIds),
    ];

    kabupatenIds = [
      ...new Set(kabupatenIds),
    ];

    // ==================================================
    // VALIDASI TUJUAN
    // ==================================================

    // ==================================================
    // CEK ASAL
    // ==================================================

    let finalAsalSuratId = Number(asalSuratId);

    if (asalSuratId === "LAINNYA" && asalSuratLainnya) {
      const existing = await prisma.asalSurat.findFirst({
        where: { nama: asalSuratLainnya.trim() },
      });
      if (existing) {
        finalAsalSuratId = existing.id;
      } else {
        const newAsal = await prisma.asalSurat.create({
          data: { nama: asalSuratLainnya.trim() },
        });
        finalAsalSuratId = newAsal.id;
      }
    } else {
      const asalSurat = await prisma.asalSurat.findFirst({
        where: { id: finalAsalSuratId, aktif: true },
      });
      if (!asalSurat) {
        return res.status(400).json({ success: false, message: "Asal surat tidak valid" });
      }
    }

    // ==================================================
    // CEK TUJUAN
    // ==================================================

    const tujuan =
      await prisma.tujuan.findMany({
        where: {
          id: {
            in: tujuanIds,
          },
          aktif: true,
        },
      });

    if (
      tujuan.length !==
      tujuanIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Terdapat tujuan surat yang tidak valid",
      });
    }

    // ==================================================
    // CEK TEMBUSAN
    // ==================================================

    if (tembusanIds.length > 0) {
      const tembusan =
        await prisma.tujuan.findMany({
          where: {
            id: {
              in: tembusanIds,
            },
            aktif: true,
          },
        });

      if (
        tembusan.length !==
        tembusanIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Terdapat tembusan yang tidak valid",
        });
      }
    }

    // ==================================================
    // CEK KABUPATEN
    // ==================================================

    if (kabupatenIds.length > 0) {
      const kabupaten =
        await prisma.kabupaten.findMany({
          where: {
            id: {
              in: kabupatenIds,
            },
            aktif: true,
          },
        });

      if (
        kabupaten.length !==
        kabupatenIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Terdapat kabupaten/kota yang tidak valid",
        });
      }
    }

    // ==================================================
    // UPDATE DATABASE
    // ==================================================

    const surat =
      await prisma.$transaction(
        async (tx) => {
          // ============================================
          // HAPUS RELASI LAMA
          // ============================================

          await tx.suratTujuan.deleteMany({
            where: {
              suratId: id,
            },
          });

          await tx.suratTembusan.deleteMany({
            where: {
              suratId: id,
            },
          });

          await tx.suratKabupaten.deleteMany({
            where: {
              suratId: id,
            },
          });

          // ============================================
          // DATA UPDATE
          // ============================================

          const updateData = {
            nomorSurat,

            tanggalSurat:
              parsedTanggal,

            asalSuratId:
              finalAsalSuratId,

            keterangan:
              keterangan || null,

            tujuanSurat: {
              create:
                tujuanIds.map(
                  (tujuanId) => ({
                    tujuanId,
                  })
                ),
            },

            tembusanSurat: {
              create:
                tembusanIds.map(
                  (tujuanId) => ({
                    tujuanId,
                  })
                ),
            },

            kabupatenSurat: {
              create:
                kabupatenIds.map(
                  (kabupatenId) => ({
                    kabupatenId,
                  })
                ),
            },
          };

          // ============================================
          // JIKA ADA FILE BARU
          // ============================================

          if (req.files && req.files.length > 0) {
            updateData.lampiran = {
              create: req.files.map((file) => ({
                fileName: file.originalname,
                filePath: file.path,
              }))
            };
          }

          // ============================================
          // UPDATE SURAT
          // ============================================

          const suratUpdated =
            await tx.surat.update({
              where: {
                id,
              },

              data: updateData,

              include:
                suratInclude,
            });

          return suratUpdated;
        }
      );

    // ==================================================
    // DATABASE BERHASIL
    // ==================================================

    fileCommitted = true;

    // ==================================================
    // FILTER RESPONSE
    // ==================================================

    const scope =
      await getAccessScope(
        req.user
      );

    const suratFiltered =
      filterSuratByAccess(
        surat,
        scope
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      message:
        "Surat berhasil diperbarui",
      data: suratFiltered,
    });
  } catch (error) {
    console.error(
      "Update surat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal memperbarui surat",
    });
  } finally {
    // ==================================================
    // CLEANUP FILE BARU JIKA UPDATE GAGAL
    // ==================================================

    if (!fileCommitted && req.files && req.files.length > 0) {
      req.files.forEach((f) => safeUnlink(f.path));
    }
  }
};

// ======================================================
// DELETE SURAT
// ======================================================

const deleteSurat = async (
  req,
  res
) => {
  try {
    const id = Number(
      req.params.id
    );

    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "ID surat tidak valid",
      });
    }

    // ==================================================
    // CEK SURAT
    // ==================================================

    const surat =
      await prisma.surat.findUnique({
        where: {
          id,
        },
      });

    if (!surat) {
      return res.status(404).json({
        success: false,
        message:
          "Surat tidak ditemukan",
      });
    }

    // ==================================================
    // CEK AKSES
    // ==================================================

    const hasAccess =
      await checkSuratAccess(
        req.user,
        id
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message:
          "Anda tidak memiliki akses untuk menghapus surat ini",
      });
    }

    // ==================================================
    // BLOKIR JIKA BUKAN DRAFT
    // ==================================================

    if (surat.status !== "DRAFT") {
      return res.status(403).json({
        success: false,
        message:
          "Surat yang sudah terkirim tidak dapat dihapus",
      });
    }

    // ==================================================
    // HAPUS DATABASE
    // ==================================================

    await prisma.$transaction(
      async (tx) => {
        // ==============================================
        // HAPUS TUJUAN
        // ==============================================

        await tx.suratTujuan.deleteMany({
          where: {
            suratId: id,
          },
        });

        // ==============================================
        // HAPUS TEMBUSAN
        // ==============================================

        await tx.suratTembusan.deleteMany({
          where: {
            suratId: id,
          },
        });

        // ==============================================
        // HAPUS KABUPATEN
        // ==============================================

        await tx.suratKabupaten.deleteMany({
          where: {
            suratId: id,
          },
        });

        // ==============================================
        // HAPUS SURAT
        // ==============================================

        await tx.surat.delete({
          where: {
            id,
          },
        });
      }
    );

    // ==================================================
    // HAPUS FILE FISIK
    // ==================================================

    if (surat.lampiran && surat.lampiran.length > 0) {
      surat.lampiran.forEach((lamp) => safeUnlink(lamp.filePath));
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      message:
        "Surat berhasil dihapus",
    });
  } catch (error) {
    console.error(
      "Delete surat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal menghapus surat",
    });
  }
};

// ======================================================
// UPDATE STATUS SURAT
// ======================================================

const updateStatusSurat = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID surat tidak valid" });
    }

    const { status, catatan } = req.body;
    const userRole = req.user.role;
    const userId = Number(req.user.userId);

    const surat = await prisma.surat.findUnique({
      where: { id },
      include: { tujuanSurat: true, kabupatenSurat: true, tembusanSurat: true }
    });

    if (!surat) return res.status(404).json({ success: false, message: "Surat tidak ditemukan" });
    if (!(await checkSuratAccess(req.user, id))) {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }

    if (userRole === "OPERATOR" || userRole === "USER_INSTANSI") {
      if (surat.status !== "DRAFT" || status !== "TERKIRIM") {
        return res.status(400).json({ success: false, message: "Pembuat surat hanya bisa mengirim surat yang berstatus DRAFT" });
      }
      await prisma.$transaction([
        prisma.surat.update({ where: { id }, data: { status: "TERKIRIM" } }),
        prisma.suratTujuan.updateMany({ where: { suratId: id }, data: { status: "TERKIRIM" } }),
        prisma.suratKabupaten.updateMany({ where: { suratId: id }, data: { status: "TERKIRIM" } }),
        prisma.suratTembusan.updateMany({ where: { suratId: id }, data: { status: "TERKIRIM" } })
      ]);
    } else if (userRole === "ADMIN") {
      if (surat.status === "DRAFT") {
        return res.status(400).json({ success: false, message: "Surat belum dikirim oleh operator" });
      }
      if (surat.status === "SELESAI" || surat.status === "DITOLAK") {
        return res.status(400).json({ success: false, message: "Surat sudah dalam status final dan tidak dapat diubah lagi" });
      }
      if (!["SELESAI", "DITOLAK"].includes(status)) {
        return res.status(400).json({ success: false, message: "Admin hanya bisa set SELESAI/DITOLAK" });
      }

      const scope = await getAccessScope(req.user);
      const updateData = { status, catatan: catatan || null, processedById: userId };
      
      await prisma.$transaction(async (tx) => {
        if (scope.type === "TUJUAN") {
          await tx.suratTujuan.updateMany({ where: { suratId: id, tujuanId: { in: scope.tujuanIds } }, data: updateData });
          await tx.suratTembusan.updateMany({ where: { suratId: id, tujuanId: { in: scope.tujuanIds } }, data: updateData });
        } else if (scope.type === "KABUPATEN") {
          await tx.suratKabupaten.updateMany({ where: { suratId: id, kabupatenId: { in: scope.kabupatenIds } }, data: updateData });
        }

        const updated = await tx.surat.findUnique({ where: { id }, include: { tujuanSurat: true, kabupatenSurat: true, tembusanSurat: true } });
        const targets = [...updated.tujuanSurat, ...updated.kabupatenSurat, ...updated.tembusanSurat];
        
        // Recalculate global status:
        // - Semua SELESAI → SELESAI
        // - Semua sudah diproses (campuran SELESAI/DITOLAK) dan ada DITOLAK → DITOLAK
        // - Masih ada yang TERKIRIM → DIPROSES (sedang dalam proses)
        const allSelesai = targets.every(t => t.status === "SELESAI");
        const allProcessed = targets.every(t => t.status === "SELESAI" || t.status === "DITOLAK");
        const anyDitolak = targets.some(t => t.status === "DITOLAK");
        
        let newGlobalStatus = "DIPROSES";
        if (allSelesai) newGlobalStatus = "SELESAI";
        else if (allProcessed && anyDitolak) newGlobalStatus = "DITOLAK";
        
        await tx.surat.update({ where: { id }, data: { status: newGlobalStatus } });
      });
    }

    const finalSurat = await prisma.surat.findUnique({ where: { id }, include: suratInclude });
    return res.status(200).json({ success: true, message: "Status surat berhasil diperbarui", data: filterSuratByAccess(finalSurat, await getAccessScope(req.user)) });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ success: false, message: "Gagal memperbarui status" });
  }
};

// ======================================================
// BULK DELETE SURAT
// ======================================================

const bulkDeleteSurat = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Pilih minimal satu surat untuk dihapus" });
    }

    if (req.user.role !== "OPERATOR") {
      return res.status(403).json({ success: false, message: "Hanya Operator yang dapat menghapus surat" });
    }

    const suratIds = ids.map(Number).filter(n => Number.isInteger(n) && n > 0);

    if (suratIds.length === 0) {
      return res.status(400).json({ success: false, message: "ID surat tidak valid" });
    }

    // Get all files to delete from file system
    const suratToDelete = await prisma.surat.findMany({
      where: { id: { in: suratIds } },
      select: { lampiran: true },
    });

    await prisma.$transaction(async (tx) => {
      // Delete relationships first (if not cascade, but Prisma schema has onDelete: Cascade, so it's safer to just delete Surat, but let's be explicit if needed. Since it's cascade in schema, deleting Surat is enough)
      await tx.surat.deleteMany({
        where: { id: { in: suratIds } },
      });
    });

    // Delete files
    const fs = require("fs");
    const path = require("path");
    // Hapus file fisik
    suratToDelete.forEach((surat) => {
      if (surat.lampiran && surat.lampiran.length > 0) {
        surat.lampiran.forEach((lamp) => {
          const fullPath = path.join(__dirname, "../../", lamp.filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
    });

    res.json({ success: true, message: `${suratIds.length} surat berhasil dihapus` });
  } catch (error) {
    console.error("Bulk delete surat error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus surat secara massal" });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createSurat,
  getAllSurat,
  getSuratById,
  updateSurat,
  deleteSurat,
  bulkDeleteSurat,
  updateStatusSurat,
};