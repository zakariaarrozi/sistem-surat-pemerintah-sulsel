-- AlterTable
ALTER TABLE `users` ADD COLUMN `adminType` ENUM('PIMPINAN', 'KABUPATEN', 'INSTANSI') NULL;

-- CreateTable
CREATE TABLE `admin_tujuan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminId` INTEGER NOT NULL,
    `tujuanId` INTEGER NOT NULL,

    INDEX `admin_tujuan_tujuanId_idx`(`tujuanId`),
    UNIQUE INDEX `admin_tujuan_adminId_tujuanId_key`(`adminId`, `tujuanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_kabupaten` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminId` INTEGER NOT NULL,
    `kabupatenId` INTEGER NOT NULL,

    INDEX `admin_kabupaten_kabupatenId_idx`(`kabupatenId`),
    UNIQUE INDEX `admin_kabupaten_adminId_kabupatenId_key`(`adminId`, `kabupatenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_tujuan` ADD CONSTRAINT `admin_tujuan_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_tujuan` ADD CONSTRAINT `admin_tujuan_tujuanId_fkey` FOREIGN KEY (`tujuanId`) REFERENCES `tujuan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_kabupaten` ADD CONSTRAINT `admin_kabupaten_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_kabupaten` ADD CONSTRAINT `admin_kabupaten_kabupatenId_fkey` FOREIGN KEY (`kabupatenId`) REFERENCES `kabupaten`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
