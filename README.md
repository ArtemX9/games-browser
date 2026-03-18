# Games Browser

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

A self-hosted web app for browsing a local game library. It scans a `/games` directory, enriches metadata from [IGDB](https://www.igdb.com/), stores results in SQLite, and serves a React frontend that groups games by platform with cover art, descriptions, and download support.

Designed to run on a NAS (tested on UGREEN NASync DXP4800 PLUS).

## Features

- Scans a local `/games` folder organized by platform
- Fetches cover art, descriptions, genres, and release dates from IGDB
- Falls back to local `thumbnail.png` / `description.txt` if no IGDB match
- Groups games by platform in the UI
- Rescan button to pick up new games without restarting
- Download button to zip and download a game folder

## Supported Platforms

Games must be organized into folders named exactly as follows:

| Folder name | Platform         |
|-------------|------------------|
| `PS`        | PlayStation      |
| `PS 2`      | PlayStation 2    |
| `PS 3`      | PlayStation 3    |
| `PSP`       | PSP              |
| `PS Vita`   | PlayStation Vita |
| `Xbox`      | Xbox             |
| `Xbox 360`  | Xbox 360         |
| `Win`       | PC (Windows)     |
| `Mac`       | macOS            |

## Game Folder Structure

```
/games/
  {Platform}/
    {Game Name}/
      thumbnail.png    # optional fallback cover
      icon.png         # optional icon
      description.txt  # optional fallback description
      ...              # game files
```

Example:
```
/games/
  PS 2/
    Shadow of the Colossus/
      thumbnail.png
      game.iso
  Win/
    Hades/
      description.txt
      Hades.exe
```

## Configuration

IGDB credentials are required for metadata enrichment. Get them for free at [dev.twitch.tv](https://dev.twitch.tv/console/apps) by creating an app with category **Website Integration**.

| Variable             | Description                  |
|----------------------|------------------------------|
| `IGDB_CLIENT_ID`     | Twitch app Client ID         |
| `IGDB_CLIENT_SECRET` | Twitch app Client Secret     |

## Running with Docker (recommended)

1. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
IGDB_CLIENT_ID=your_twitch_client_id
IGDB_CLIENT_SECRET=your_twitch_client_secret
GAMES_PATH=/path/to/your/games
```

2. Start:

```bash
docker-compose up
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Running Locally (development)

**Requirements:** Node.js 22+

### Backend

```bash
cd backend
npm install
npm run dev       # ts-node (development)
# or
npm run build && npm run start   # compiled
```

Set credentials via environment variables or a `.env` file at `/app/.env`:
```
IGDB_CLIENT_ID=your_client_id
IGDB_CLIENT_SECRET=your_client_secret
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Vite dev server at http://localhost:5173
```

## API

| Endpoint                                  | Description                              |
|-------------------------------------------|------------------------------------------|
| `GET /api/games`                          | All games from DB, ordered by platform   |
| `GET /api/rescan`                         | Re-scan the `/games` directory           |
| `GET /media/{platform}/{folder}/thumbnail.png` | Serve local cover image            |

## Tech Stack

- **Backend:** Node.js 22, Express, TypeScript, SQLite, IGDB API
- **Frontend:** React, Redux, Vite, Tailwind CSS v4, shadcn/ui