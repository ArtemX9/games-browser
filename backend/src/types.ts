export interface Game {
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

export interface IgdbGameData {
  name: string;
  description: string;
  thumbnail: string | null;
  releaseDate: string;
  genres: string;
  platforms: string;
}
