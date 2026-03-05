# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A self-hosted games library browser designed for a NAS (UGREEN NASync DXP4800 PLUS). It scans a local `/games` directory, enriches game metadata from IGDB, stores it in SQLite, and serves a React frontend that groups games by platform.

## Development Commands

### Backend (`/backend`)
```bash
npm run dev      # Run with ts-node (development)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled output
```

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Deployment
```bash
docker-compose up  # Runs both services for NAS deployment
```

## Architecture

### Backend (`backend/src/`)
- **`index.ts`** — Express server on port 3001. Runs `scanGames()` on startup, exposes `GET /api/games` and `GET /api/rescan`. Serves static files from `/games` at `/media`.
- **`scanner.ts`** — Reads `/games/{Platform}/{game_folder}/` directory tree. For each game folder, checks for local `thumbnail.png`, `icon.png`, `description.txt`, then calls IGDB. IGDB data takes priority over local files.
- **`igdb.ts`** — Twitch OAuth token management + IGDB API search. Searches by game name filtered to a specific platform ID. Platform folder names map to IGDB platform IDs via `PLATFORM_TO_IGDB_ID`.
- **`db.ts`** — SQLite via `sqlite3`. Single `games` table. `insertGame` uses `INSERT OR REPLACE` (keyed on `display_name`).

### Frontend (`frontend/src/`)
- **State**: Redux (non-toolkit) with thunks. Single `games` reducer with `isLoading/isError/games` state. Pattern: `actions/games.ts` → `thunks/games.ts` → `api/api.ts` → `api/routes.ts`.
- **Component pattern**: `AppContainer.tsx` (Redux-connected, groups games by platform) renders `App.tsx` (pure presentational).
- **UI**: shadcn/ui components + Tailwind CSS v4. Components in `src/components/ui/` are shadcn-generated.

### Game Folder Convention
```
/games/
  {Platform}/          # e.g. "PS 2", "Xbox 360", "Win"
    {game_folder}/
      thumbnail.png    # optional, used if IGDB has no cover
      icon.png         # optional
      description.txt  # optional, used if IGDB has no summary
```

### Environment Variables
The backend requires these at `/app/.env` (or in docker-compose environment):
- `IGDB_CLIENT_ID` — Twitch app client ID
- `IGDB_CLIENT_SECRET` — Twitch app client secret

### API Endpoints
- `GET /api/games` — Returns all games from SQLite, ordered by platform then name
- `GET /api/rescan` — Triggers a full rescan of the `/games` directory
- `GET /media/{platform}/{folder}/thumbnail.png` — Static file serving from `/games`
