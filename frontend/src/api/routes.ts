export const getGamesURL = () => `/api/games`;
export const getRescanURL = () => `/api/rescan`;
export const getDownloadURL = (platform: string, gameFolder: string) =>
  `/api/download/${encodeURIComponent(platform)}/${encodeURIComponent(gameFolder)}`;
export const getIgdbSearchURL = (query: string, platform: string) =>
  `/api/igdb-search?query=${encodeURIComponent(query)}&platform=${encodeURIComponent(platform)}`;
export const getUpdateGameURL = (platform: string, gameFolder: string) =>
  `/api/games/${encodeURIComponent(platform)}/${encodeURIComponent(gameFolder)}`;
