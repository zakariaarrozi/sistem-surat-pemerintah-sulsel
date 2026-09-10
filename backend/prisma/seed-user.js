require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const bcrypt = require("bcryptjs");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("👤 Membuat user operator...");

  const password = await bcrypt.hash("Operator123!", 10);

  const user = await prisma.user.upsert({
    where: {
      email: "operator@sulsel.go.id",
    },
    update: {},
    create: {
      name: "Operator Surat",
      email: "operator@sulsel.go.id",
      password,
      role: "OPERATOR",
    },
  });

  console.log("✅ User berhasil dibuat/ditemukan");
  console.log(`   ID    : ${user.id}`);
  console.log(`   Nama  : ${user.name}`);
  console.log(`   Email : ${user.email}`);
  console.log(`   Role  : ${user.role}`);
}

main()
  .catch((error) => {
    console.error("❌ Gagal membuat user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });