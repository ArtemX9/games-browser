/*
  Warnings:

  - You are about to alter the column `manually_matched` on the `games` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_games" (
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
    "manually_matched" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_games" ("description", "display_name", "game_folder", "genres", "icon", "id", "igdb_platforms", "manually_matched", "platform", "release_date", "thumbnail") SELECT "description", "display_name", "game_folder", "genres", "icon", "id", "igdb_platforms", coalesce("manually_matched", false) AS "manually_matched", "platform", "release_date", "thumbnail" FROM "games";
DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_games_1" ON "games"("display_name");
Pragma writable_schema=0;
CREATE UNIQUE INDEX "games_game_folder_display_name_key" ON "games"("game_folder", "display_name");
CREATE UNIQUE INDEX "games_game_folder_platform_key" ON "games"("game_folder", "platform");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
