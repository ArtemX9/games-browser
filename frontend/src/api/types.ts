export interface IgdbSearchResult {
  name: string;
  description: string;
  thumbnail: string | null;
  releaseDate: string;
  genres: string;
  platforms: string;
}

/**
 * Game row as returned by GET /api/games.
 * Mirrors the backend Game interface (snake_case, matching SQLite column names).
 */
export interface ApiGame {
  id: number;
  display_name: string;
  thumbnail: string;
  icon: string;
  description: string;
  platform: string;
  game_folder: string;
  release_date: string;
  genres: string;
  igdb_platforms: string;
}
