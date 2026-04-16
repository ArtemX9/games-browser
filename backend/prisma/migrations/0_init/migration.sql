-- CreateTable
CREATE TABLE "games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "display_name" TEXT,
    "thumbnail" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "platform" TEXT,
    "game_folder" TEXT,
    "release_date" TEXT,
    "genres" TEXT,
    "igdb_platforms" TEXT,
    "manually_matched" INTEGER DEFAULT 0
);

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_games_1" ON "games"("display_name");
Pragma writable_schema=0;

