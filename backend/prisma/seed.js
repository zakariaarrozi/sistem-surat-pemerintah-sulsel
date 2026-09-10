require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  adapter,
});

const tujuanData = [
  "Gubernur Sulawesi Selatan",
  "Wakil Gubernur Sulawesi Selatan",
  "Sekretaris Daerah Provinsi Sulawesi Selatan",
  "Badan Kesatuan Bangsa dan Politik Provinsi Sulawesi Selatan",
  "Badan Keuangan dan Aset Daerah Provinsi Sulawesi Selatan",
  "Badan Kepegawaian Daerah Provinsi Sulawesi Selatan",
  "Badan Penanggulangan Bencana Daerah Provinsi Sulawesi Selatan",
  "Badan Pendapatan Daerah Prov. Sulawesi Selatan",
  "Badan Pengembangan Sumber Daya Manusia Prov. Sulawesi Selatan",
  "Badan Penghubung Prov. Sulawesi Selatan",
  "Badan Perencanaan, Pembangunan, Penelitian dan Pengembangan Daerah Prov. Sulawesi Selatan",
  "Biro Umum Setda Prov. Sulawesi Selatan",
  "Biro Hukum Setda Prov. Sulawesi Selatan",
  "Biro Organisasi Setda Prov. Sulawesi Selatan",
  "Biro Pengadaan Barang & Jasa Setda Prov. Sulawesi Selatan",
  "Biro Ekonomi dan Administrasi Pembangunan Setda Prov. Sulawesi Selatan",
  "Biro Pemerintahan dan Otonomi Daerah Setda Prov. Sulawesi Selatan",
  "Biro Kesejahteraan Setda Prov. Sulawesi Selatan",
  "Dinas Komunikasi, Informatika, Statistik & Persandian Prov. Sulawesi Selatan",
  "Dinas Kependudukan dan Pencatatan Sipil Prov. Sulawesi Selatan",
  "Dinas Lingkungan Hidup dan Kehutanan Prov. Sulawesi Selatan",
  "Dinas Pendidikan Prov. Sulawesi Selatan",
  "Dinas Kesehatan Prov. Sulawesi Selatan",
  "Dinas Tenaga Kerja dan Transmigrasi Prov. Sulawesi Selatan",
  "Dinas Perhubungan Prov. Sulawesi Selatan",
  "Dinas Kepemudaan dan Olahraga Prov. Sulawesi Selatan",
  "Dinas Perpustakaan & Kearsipan Prov. Sulawesi Selatan",
  "Dinas Pemberdayaan Masyarakat & Desa Prov. Sul Sel",
  "Dinas Penanaman Modal & Pelayanan Terpadu Satu Pintu Prov. Susel",
  "Dinas Sosial Prov. Sulawesi Selatan",
  "Dinas Energi dan Sumber Daya Mineral Prov. Sulawesi Selatan",
  "Dinas Sumber Daya Air, Cipta Karya dan Tata Ruang Prov. Sulawesi Selatan",
  "Dinas Bina Marga dan Bina Konstruksi Prov. Sulawesi Selatan",
  "Dinas Perumahan, Kawasan Permukiman & Pertanahan Prov. Sulsel",
  "Dinas Koperasi Usaha Kecil & Menengah Prov. Sulawesi Selatan",
  "Dinas Peternakan dan Kesehatan Hewan Prov. Sulawesi Selatan",
  "Dinas Kelautan dan Perikanan Prov. Sulawesi Selatan",
  "Dinas Perindustrian & Perdagangan Prov. Sulawesi Selatan",
  "Dinas Kebudayaan & Kepariwisataan Prov. Sulawesi Selatan",
  "Dinas Tanaman Pangan, Hortikultura dan Perkebunan Prov. Sulawesi Selatan",
  "Dinas Ketahanan Pangan Prov. Sulawesi Selatan",
  "Dinas Pemberdayaan Perempuan & Perlindungan Anak Pengendalian Penduduk dan Keluarga Berencana Prov. Sulawesi Selatan",
  "Satuan Polisi Pamong Praja Provinsi Sulawesi Selatan",
  "Inspektur Prov. Sulawesi Selatan",
  "Sekretaris DPRD Prov. Sulawesi Selatan",
  "Lainnya",
];

const kabupatenData = [
  {
    nama: "Kota Makassar",
    tipe: "KOTA",
  },
  {
    nama: "Kabupaten Gowa",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Takalar",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Jeneponto",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Bantaeng",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Bulukumba",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Kepulauan Selayar",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Sinjai",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kota Parepare",
    tipe: "KOTA",
  },
  {
    nama: "Kabupaten Maros",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Pangkajene dan Kepulauan",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Barru",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Sidenreng Rappang",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Bone",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Soppeng",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Wajo",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kota Palopo",
    tipe: "KOTA",
  },
  {
    nama: "Kabupaten Pinrang",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Enrekang",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Luwu",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Luwu Utara",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Luwu Timur",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Tana Toraja",
    tipe: "KABUPATEN",
  },
  {
    nama: "Kabupaten Toraja Utara",
    tipe: "KABUPATEN",
  },
];

async function main() {
  console.log("🌱 Memulai seed database...");

  // ============================
  // SEED TUJUAN / TEMBUSAN
  // ============================

  for (const nama of tujuanData) {
    await prisma.tujuan.upsert({
      where: {
        nama,
      },
      update: {
        aktif: true,
      },
      create: {
        nama,
      },
    });
  }

  console.log(`✅ ${tujuanData.length} data tujuan berhasil diproses`);

  // ============================
  // SEED KABUPATEN / KOTA
  // ============================

  for (const data of kabupatenData) {
    await prisma.kabupaten.upsert({
      where: {
        nama: data.nama,
      },
      update: {
        tipe: data.tipe,
        aktif: true,
      },
      create: data,
    });
  }

  console.log(
    `✅ ${kabupatenData.length} data kabupaten/kota berhasil diproses`
  );

  console.log("🎉 Seed database selesai!");
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });