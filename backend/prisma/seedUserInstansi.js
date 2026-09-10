const prisma = require("../src/config/prisma");
const bcrypt = require("bcryptjs");

const instansiList = [
  { nama: "Badan Kesatuan Bangsa dan Politik Provinsi Sulawesi Selatan", email: "kesbangpol@sulsel.go.id" },
  { nama: "Badan Keuangan dan Aset Daerah Provinsi Sulawesi Selatan", email: "bkad@sulsel.go.id" },
  { nama: "Badan Kepegawaian Daerah Provinsi Sulawesi Selatan", email: "bkd@sulsel.go.id" },
  { nama: "Badan Penanggulangan Bencana Daerah Provinsi Sulawesi Selatan", email: "bpbd@sulsel.go.id" },
  { nama: "Badan Pendapatan Daerah Prov. Sulawesi Selatan", email: "bapenda@sulsel.go.id" },
  { nama: "Badan Pengembangan Sumber Daya Manusia Prov. Sulawesi Selatan", email: "bpsdm@sulsel.go.id" },
  { nama: "Badan Penghubung Prov. Sulawesi Selatan", email: "penghubung@sulsel.go.id" },
  { nama: "Badan Perencanaan, Pembangunan, Penelitian dan Pengembangan Daerah Prov. Sulawesi Selatan", email: "bappeda@sulsel.go.id" },
  { nama: "Biro Umum Setda Prov. Sulawesi Selatan", email: "biroupum@sulsel.go.id" },
  { nama: "Biro Hukum Setda Prov. Sulawesi Selatan", email: "birohukum@sulsel.go.id" },
  { nama: "Biro Organisasi Setda Prov. Sulawesi Selatan", email: "biroorgan@sulsel.go.id" },
  { nama: "Biro Pengadaan Barang & Jasa Setda Prov. Sulawesi Selatan", email: "biropbj@sulsel.go.id" },
  { nama: "Biro Ekonomi dan Administrasi Pembangunan Setda Prov. Sulawesi Selatan", email: "biroekon@sulsel.go.id" },
  { nama: "Biro Pemerintahan dan Otonomi Daerah Setda Prov. Sulawesi Selatan", email: "biropem@sulsel.go.id" },
  { nama: "Biro Kesejahteraan Setda Prov. Sulawesi Selatan", email: "birokesra@sulsel.go.id" },
  { nama: "Dinas Komunikasi, Informatika, Statistik & Persandian Prov. Sulawesi Selatan", email: "diskominfo@sulsel.go.id" },
  { nama: "Dinas Kependudukan dan Pencatatan Sipil Prov. Sulawesi Selatan", email: "disdukcapil@sulsel.go.id" },
  { nama: "Dinas Lingkungan Hidup dan Kehutanan Prov. Sulawesi Selatan", email: "dlhk@sulsel.go.id" },
  { nama: "Dinas Pendidikan Prov. Sulawesi Selatan", email: "disdik@sulsel.go.id" },
  { nama: "Dinas Kesehatan Prov. Sulawesi Selatan", email: "dinkes@sulsel.go.id" },
  { nama: "Dinas Tenaga Kerja dan Transmigrasi Prov. Sulawesi Selatan", email: "disnakertrans@sulsel.go.id" },
  { nama: "Dinas Perhubungan Prov. Sulawesi Selatan", email: "dishub@sulsel.go.id" },
  { nama: "Dinas Kepemudaan dan Olahraga Prov. Sulawesi Selatan", email: "dispora@sulsel.go.id" },
  { nama: "Dinas Perpustakaan & Kearsipan Prov. Sulawesi Selatan", email: "dispusip@sulsel.go.id" },
  { nama: "Dinas Pemberdayaan Masyarakat & Desa Prov. Sul Sel", email: "dpmd@sulsel.go.id" },
  { nama: "Dinas Penanaman Modal & Pelayanan Terpadu Satu Pintu Prov. Sulsel", email: "dpmptsp@sulsel.go.id" },
  { nama: "Dinas Sosial Prov. Sulawesi Selatan", email: "dinsos@sulsel.go.id" },
  { nama: "Dinas Energi dan Sumber Daya Mineral Prov. Sulawesi Selatan", email: "desdm@sulsel.go.id" },
  { nama: "Dinas Sumber Daya Air, Cipta Karya dan Tata Ruang Prov. Sulawesi Selatan", email: "dsdack@sulsel.go.id" },
  { nama: "Dinas Bina Marga dan Bina Konstruksi Prov. Sulawesi Selatan", email: "dbmk@sulsel.go.id" },
  { nama: "Dinas Perumahan, Kawasan Permukiman & Pertanahan Prov. Sulsel", email: "dpkp@sulsel.go.id" },
  { nama: "Dinas Koperasi Usaha Kecil & Menengah Prov. Sulawesi Selatan", email: "diskopukm@sulsel.go.id" },
  { nama: "Dinas Peternakan dan Kesehatan Hewan Prov. Sulawesi Selatan", email: "disnakkeswan@sulsel.go.id" },
  { nama: "Dinas Kelautan dan Perikanan Prov. Sulawesi Selatan", email: "dkp@sulsel.go.id" },
  { nama: "Dinas Perindustrian & Perdagangan Prov. Sulawesi Selatan", email: "disperindag@sulsel.go.id" },
  { nama: "Dinas Kebudayaan & Kepariwisataan Prov. Sulawesi Selatan", email: "disbudpar@sulsel.go.id" },
  { nama: "Dinas Tanaman Pangan, Hortikultura dan Perkebunan Prov. Sulawesi Selatan", email: "distphp@sulsel.go.id" },
  { nama: "Dinas Ketahanan Pangan Prov. Sulawesi Selatan", email: "dishantipan@sulsel.go.id" },
  { nama: "Dinas Pemberdayaan Perempuan & Perlindungan Anak Pengendalian Penduduk dan Keluarga Berencana Prov. Sulawesi Selatan", email: "dp3akb@sulsel.go.id" },
  { nama: "Satuan Polisi Pamong Praja Provinsi Sulawesi Selatan", email: "satpolpp@sulsel.go.id" },
  { nama: "Inspektur Prov. Sulawesi Selatan", email: "inspektorat@sulsel.go.id" },
  { nama: "Sekretaris DPRD Prov. Sulawesi Selatan", email: "setwan@sulsel.go.id" },
  { nama: "Lainnya", email: "instansi.lainnya@sulsel.go.id" },
];

const DEFAULT_PASSWORD = "Instansi@123";

async function main() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  console.log("🔄 Membuat akun User Instansi OPD Sulsel...\n");

  for (const instansi of instansiList) {
    // 1. Upsert AsalSurat
    const asalSurat = await prisma.asalSurat.upsert({
      where: { nama: instansi.nama },
      update: { aktif: true },
      create: { nama: instansi.nama, aktif: true },
    });

    // 2. Upsert User
    await prisma.user.upsert({
      where: { email: instansi.email },
      update: {
        name: instansi.nama,
        password: hashedPassword,
        role: "USER_INSTANSI",
        instansiId: asalSurat.id,
      },
      create: {
        name: instansi.nama,
        email: instansi.email,
        password: hashedPassword,
        role: "USER_INSTANSI",
        instansiId: asalSurat.id,
      },
    });

    console.log(`✅ ${instansi.nama}`);
    console.log(`   Email    : ${instansi.email}`);
    console.log(`   Password : ${DEFAULT_PASSWORD}\n`);
  }

  console.log(`\n🎉 Selesai! ${instansiList.length} akun User Instansi berhasil dibuat.`);
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
