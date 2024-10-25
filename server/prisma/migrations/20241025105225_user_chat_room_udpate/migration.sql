-- AlterTable
ALTER TABLE `UserChatRoom` ADD COLUMN `userId2` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX `UserChatRoom_userId_idx` ON `UserChatRoom`(`userId`);
