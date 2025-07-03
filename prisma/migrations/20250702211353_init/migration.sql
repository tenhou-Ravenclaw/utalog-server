-- CreateTable
CREATE TABLE "SongHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SongHistory_id_key" ON "SongHistory"("id");

-- CreateIndex
CREATE INDEX "SongHistory_date_idx" ON "SongHistory"("date");
