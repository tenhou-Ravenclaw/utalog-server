/*
  Warnings:

  - You are about to drop the `SongHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SongHistory";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ScoringType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_song_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dxg_song_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_heart_song_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ScoringType_id_key" ON "ScoringType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringType_name_key" ON "ScoringType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ai_song_histories_id_key" ON "ai_song_histories"("id");

-- CreateIndex
CREATE INDEX "ai_song_histories_date_idx" ON "ai_song_histories"("date");

-- CreateIndex
CREATE INDEX "ai_song_histories_title_idx" ON "ai_song_histories"("title");

-- CreateIndex
CREATE UNIQUE INDEX "dxg_song_histories_id_key" ON "dxg_song_histories"("id");

-- CreateIndex
CREATE INDEX "dxg_song_histories_date_idx" ON "dxg_song_histories"("date");

-- CreateIndex
CREATE INDEX "dxg_song_histories_title_idx" ON "dxg_song_histories"("title");

-- CreateIndex
CREATE UNIQUE INDEX "ai_heart_song_histories_id_key" ON "ai_heart_song_histories"("id");

-- CreateIndex
CREATE INDEX "ai_heart_song_histories_date_idx" ON "ai_heart_song_histories"("date");

-- CreateIndex
CREATE INDEX "ai_heart_song_histories_title_idx" ON "ai_heart_song_histories"("title");
