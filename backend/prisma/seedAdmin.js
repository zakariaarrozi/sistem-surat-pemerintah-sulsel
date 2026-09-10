const prisma = require("../src/config/prisma");
const bcrypt = require("bcryptjs");

const admins = [
  // =========================
  // SUPERADMIN
  // =========================
  {
    name: "Superadmin",
    email: "superadmin@sulsel.go.id",
    password: "SuperAdmin123!",
    role: "SUPERADMIN",
  },
  // =========================
  // ADMIN PIMPINAN
  // =========================
  {
    name: "Admin Pimpinan",
    email: "admin.pimpinan@sulsel.go.id",
    password: "AdminPimpinan123!",
    adminType: "PIMPINAN",
    tujuanIds: [1, 2, 3],
  },

  // =========================
  // ADMIN KABUPATEN
  // =========================
  {
    name: "Admin Kabupaten 1",
    email: "admin.kabupaten1@sulsel.go.id",
    password: "AdminKabupaten1!",
    adminType: "KABUPATEN",
    kabupatenIds: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    name: "Admin Kabupaten 2",
    email: "admin.kabupaten2@sulsel.go.id",
    password: "AdminKabupaten2!",
    adminType: "KABUPATEN",
    kabupatenIds: [9, 10, 11, 12, 13, 14, 15, 16],
  },
  {
    name: "Admin Kabupaten 3",
    email: "admin.kabupaten3@sulsel.go.id",
    password: "AdminKabupaten3!",
    adminType: "KABUPATEN",
    kabupatenIds: [17, 18, 19, 20, 21, 22, 23, 24],
  },

  // =========================
  // ADMIN INSTANSI
  // ID 4 - 46
  // =========================
  {
    name: "Admin Instansi 1",
    email: "admin.instansi1@sulsel.go.id",
    password: "AdminInstansi1!",
    adminType: "INSTANSI",
    tujuanIds: [4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    name: "Admin Instansi 2",
    email: "admin.instansi2@sulsel.go.id",
    password: "AdminInstansi2!",
    adminType: "INSTANSI",
    tujuanIds: [13, 14, 15, 16, 17, 18, 19, 20, 21],
  },
  {
    name: "Admin Instansi 3",
    email: "admin.instansi3@sulsel.go.id",
    password: "AdminInstansi3!",
    adminType: "INSTANSI",
    tujuanIds: [22, 23, 24, 25, 26, 27, 28, 29, 30],
  },
  {
    name: "Admin Instansi 4",
    email: "admin.instansi4@sulsel.go.id",
    password: "AdminInstansi4!",
    adminType: "INSTANSI",
    tujuanIds: [31, 32, 33, 34, 35, 36, 37, 38, 39],
  },
  {
    name: "Admin Instansi 5",
    email: "admin.instansi5@sulsel.go.id",
    password: "AdminInstansi5!",
    adminType: "INSTANSI",
    tujuanIds: [40, 41, 42, 43, 44, 45, 48],
  },
];

async function main() {
  for (const admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    const user = await prisma.user.upsert({
      where: {
        email: admin.email,
      },
      update: {
        name: admin.name,
        password: hashedPassword,
        role: admin.role || "ADMIN",
        adminType: admin.adminType,
      },
      create: {
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: admin.role || "ADMIN",
        adminType: admin.adminType,
      },
    });

    // Hapus mapping lama agar seed aman dijalankan ulang
    await prisma.adminTujuan.deleteMany({
      where: {
        adminId: user.id,
      },
    });

    await prisma.adminKabupaten.deleteMany({
      where: {
        adminId: user.id,
      },
    });

    // Mapping tujuan
    if (admin.tujuanIds) {
      await prisma.adminTujuan.createMany({
        data: admin.tujuanIds.map((tujuanId) => ({
          adminId: user.id,
          tujuanId,
        })),
      });
    }

    // Mapping kabupaten
    if (admin.kabupatenIds) {
      await prisma.adminKabupaten.createMany({
        data: admin.kabupatenIds.map((kabupatenId) => ({
          adminId: user.id,
          kabupatenId,
        })),
      });
    }

    console.log(`✅ ${admin.name} berhasil dibuat`);
  }
}

main()
  .catch((error) => {
    console.error("❌ Seed admin gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
