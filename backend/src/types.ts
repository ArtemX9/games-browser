export type Game = {
  id: number;
  display_name: string | null;
  thumbnail: string | null;
  icon: string | null;
  description: string | null;
  platform: string | null;
  game_folder: string | null;
  release_date: string | null;
  genres: string | null;
  igdb_platforms: string | null;
  manually_matched: boolean;
}

export type IgdbGameData = {
  name: string;
  description: string;
  thumbnail: string | null;
  releaseDate: string;
  genres: string;
  platforms: string;
}
