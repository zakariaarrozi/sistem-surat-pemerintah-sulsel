-- 1. Buat tabel asal_surat terlebih dahulu
CREATE TABLE `asal_surat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `asal_surat_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- 2. Tambahkan kolom asalSuratId sementara
ALTER TABLE `surat`
ADD COLUMN `asalSuratId` INTEGER NULL;


-- 3. Pindahkan data asalSurat lama ke tabel asal_surat
INSERT INTO `asal_surat` (`nama`, `aktif`, `createdAt`, `updatedAt`)
SELECT DISTINCT
    `asalSurat`,
    true,
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
FROM `surat`
WHERE `asalSurat` IS NOT NULL;


-- 4. Hubungkan surat lama dengan data asal_surat
UPDATE `surat` s
INNER JOIN `asal_surat` a
    ON s.`asalSurat` = a.`nama`
SET s.`asalSuratId` = a.`id`;


-- 5. Baru setelah data berhasil dipindahkan,
-- hapus kolom asalSurat lama
ALTER TABLE `surat`
DROP COLUMN `asalSurat`;


-- 6. Tambahkan foreign key
ALTER TABLE `surat`
ADD CONSTRAINT `surat_asalSuratId_fkey`
FOREIGN KEY (`asalSuratId`)
REFERENCES `asal_surat`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;
