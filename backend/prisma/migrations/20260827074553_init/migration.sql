-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'OPERATOR') NOT NULL DEFAULT 'OPERATOR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomorSurat` VARCHAR(191) NOT NULL,
    `tanggalSurat` DATETIME(3) NOT NULL,
    `asalSurat` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'TERKIRIM', 'DIPROSES', 'SELESAI', 'DITOLAK') NOT NULL DEFAULT 'DRAFT',
    `keterangan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `surat_userId_idx`(`userId`),
    INDEX `surat_tanggalSurat_idx`(`tanggalSurat`),
    INDEX `surat_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tujuan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tujuan_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surat_tujuan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `suratId` INTEGER NOT NULL,
    `tujuanId` INTEGER NOT NULL,

    INDEX `surat_tujuan_tujuanId_idx`(`tujuanId`),
    UNIQUE INDEX `surat_tujuan_suratId_tujuanId_key`(`suratId`, `tujuanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surat_tembusan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `suratId` INTEGER NOT NULL,
    `tujuanId` INTEGER NOT NULL,

    INDEX `surat_tembusan_tujuanId_idx`(`tujuanId`),
    UNIQUE INDEX `surat_tembusan_suratId_tujuanId_key`(`suratId`, `tujuanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kabupaten` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kabupaten_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surat_kabupaten` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `suratId` INTEGER NOT NULL,
    `kabupatenId` INTEGER NOT NULL,

    INDEX `surat_kabupaten_kabupatenId_idx`(`kabupatenId`),
    UNIQUE INDEX `surat_kabupaten_suratId_kabupatenId_key`(`suratId`, `kabupatenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `surat` ADD CONSTRAINT `surat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surat_tujuan` ADD CONSTRAINT `surat_tujuan_suratId_fkey` FOREIGN KEY (`suratId`) REFERENCES `surat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surat_tujuan` ADD CONSTRAINT `surat_tujuan_tujuanId_fkey` FOREIGN KEY (`tujuanId`) REFERENCES `tujuan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surat_tembusan` ADD CONSTRAINT `surat_tembusan_suratId_fkey` FOREIGN KEY (`suratId`) REFERENCES `surat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surat_tembusan` ADD CONSTRAINT `surat_tembusan_tujuanId_fkey` FOREIGN KEY (`tujuanId`) REFERENCES `tujuan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surat_kabupaten` ADD CONSTRAINT `surat_kabupaten_suratId_fkey` FOREIGN KEY (`suratId`) REFERENCES `surat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surat_kabupaten` ADD CONSTRAINT `surat_kabupaten_kabupatenId_fkey` FOREIGN KEY (`kabupatenId`) REFERENCES `kabupaten`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
