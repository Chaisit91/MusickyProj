/*
  Warnings:

  - You are about to drop the `_LikedSongs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PlaylistSongs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,songId]` on the table `LikedSong` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playlistId,songId]` on the table `PlaylistSong` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,position]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_LikedSongs" DROP CONSTRAINT "_LikedSongs_A_fkey";

-- DropForeignKey
ALTER TABLE "_LikedSongs" DROP CONSTRAINT "_LikedSongs_B_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistSongs" DROP CONSTRAINT "_PlaylistSongs_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistSongs" DROP CONSTRAINT "_PlaylistSongs_B_fkey";

-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "coverUrl" TEXT;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- DropTable
DROP TABLE "_LikedSongs";

-- DropTable
DROP TABLE "_PlaylistSongs";

-- CreateIndex
CREATE INDEX "Download_userId_idx" ON "Download"("userId");

-- CreateIndex
CREATE INDEX "Download_songId_idx" ON "Download"("songId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "LikedSong_userId_idx" ON "LikedSong"("userId");

-- CreateIndex
CREATE INDEX "LikedSong_songId_idx" ON "LikedSong"("songId");

-- CreateIndex
CREATE UNIQUE INDEX "LikedSong_userId_songId_key" ON "LikedSong"("userId", "songId");

-- CreateIndex
CREATE INDEX "PlaylistSong_playlistId_idx" ON "PlaylistSong"("playlistId");

-- CreateIndex
CREATE INDEX "PlaylistSong_songId_idx" ON "PlaylistSong"("songId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistSong_playlistId_songId_key" ON "PlaylistSong"("playlistId", "songId");

-- CreateIndex
CREATE INDEX "Queue_userId_idx" ON "Queue"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Queue_userId_position_key" ON "Queue"("userId", "position");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");
