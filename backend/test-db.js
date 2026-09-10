const prisma = require('./src/config/prisma');
async function main() {
  const admin = await prisma.user.findFirst({ where: { email: "admin.gubernur@sulsel.go.id" } });
  console.log("Admin account:", admin);
}
main().catch(console.error).finally(() => prisma.$disconnect());
