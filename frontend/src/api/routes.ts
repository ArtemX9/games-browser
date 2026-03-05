export const getGamesURL = () => `/api/games`;
export const getRescanURL = () => `/api/rescan`;
export const getDownloadURL = (platform: string, gameFolder: string) =>
  `/api/download/${encodeURIComponent(platform)}/${encodeURIComponent(gameFolder)}`;
