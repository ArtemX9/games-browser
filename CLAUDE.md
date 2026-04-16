# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A self-hosted games library browser for a NAS (UGREEN NASync DXP4800 PLUS, but suitable for any other NAS). Scans a local `/games` directory, enriches metadata from IGDB, stores in SQLite, and serves a React frontend grouped by platform.

## Development Commands

### Backend (`/backend`)
```bash
npm run dev      # ts-node (development, no compile step)
npm run build    # tsc → dist/
npm run start    # run dist/index.js
```

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # tsc -b + vite build
npm run preview  # serve production build locally
npm run lint     # ESLint
npm run format   # Prettier (run before committing)
```

> **Note**: Frontend uses `--legacy-peer-deps` for installs due to React 19 peer dependency conflicts with `react-redux`.

### Docker (NAS deployment)
```bash
docker-compose up   # builds and starts both services
```

Requires a `.env` file (see `.env.example`). The `GAMES_PATH` env var must point to the games directory on the host.

## Architecture

### Backend (`backend/src/`)

| File | Responsibility |
|---|---|
| `index.ts` | Express server (port 3001). Calls `scanGames()` on startup. Mounts `/api` router, serves `/games` dir at `/media`. |
| `routes/games.ts` | `GET /api/games`, `GET /api/rescan`, `GET /api/download/:platform/:gameFolder` |
| `scanner.ts` | Walks `/games/{Platform}/{game_folder}/`. Reads local files first, then IGDB (IGDB takes priority). Clears DB then re-inserts on each scan. |
| `igdb.ts` | Twitch OAuth2 Client Credentials token management + IGDB v4 GraphQL search. Token cached with 60s early-expiry buffer. |
| `db.ts` | Database access layer via Prisma. Exposes `insertGame`, `updateGame`, `getGameByPath`, `deleteOrphanedGames`, `clearGames`, `getAllGames`. |
| `lib/prisma.ts` | Prisma client singleton using `@prisma/adapter-better-sqlite3`. Exports `prisma` and `connectDB`. |

### Frontend (`frontend/src/`)

| Path | Responsibility |
|---|---|
| `AppContainer.tsx` | Redux-connected. Groups games by platform with `useMemo`. Dispatches `fetchGamesList` on mount. |
| `App.tsx` | Pure presentational. Renders sidebar, header, platform sections. |
| `components/GameCard.tsx` | Game card with thumbnail, title, description, download button. |
| `components/GamesSidebar.tsx` | Platform nav + rescan button with spinner. Uses `sonner` for toasts. |
| `store/` | Redux (non-toolkit) + redux-thunk. Actions → Thunks → API. |
| `api/routes.ts` | Single source of truth for all URL builders. |
| `api/api.ts` | `apiFetch()` helper + `ApiException` class. |

### Game Folder Convention
```
/games/
  {Platform}/          # e.g. "PS 2", "Xbox 360", "Win"
    {game_folder}/
      thumbnail.png    # fallback cover (IGDB cover takes priority)
      icon.png         # optional
      description.txt  # fallback summary (IGDB summary takes priority)
```

### Environment Variables
```
IGDB_CLIENT_ID=       # Twitch app client ID
IGDB_CLIENT_SECRET=   # Twitch app client secret
DATABASE_URL=         # SQLite file URI, e.g. file:/app/games.db
GAMES_PATH=           # Host path mounted as /games (docker-compose only)
```

Backend reads `.env` from `/app/.env` (container path). `DATABASE_URL` must be a `file:` URI — Prisma parses it, so do not pass a plain path.

### API Endpoints
```
GET  /api/games                              # All games from SQLite, ordered by platform then name
GET  /api/rescan                             # Clears DB and rescans /games directory
GET  /api/download/:platform/:gameFolder     # Streams ZIP of game folder (no compression)
GET  /media/:platform/:folder/thumbnail.png  # Static file from /games
```

## Key Conventions

### Naming
- **API responses**: `snake_case` fields (from SQLite column names)
- **Frontend state**: `camelCase` fields — conversion happens in `store/thunks/games.ts`
- **Never** mix these: always convert at the thunk boundary, not in components or reducers

### Redux Pattern
This project uses **plain Redux (non-toolkit)**. Do not introduce Redux Toolkit.
- Add new state: create actions in `actions/`, reducer case in `reducers/`, thunk in `thunks/`
- Keep reducers pure; all async logic lives in thunks
- Use typed hooks from `store/hooks.ts` (`useAppDispatch`, `useAppSelector`)

### Adding a New API Endpoint
1. Add route handler in `backend/src/routes/games.ts`
2. Add URL builder in `frontend/src/api/routes.ts`
3. Add fetch function in `frontend/src/api/api.ts`
4. Add action/thunk if it touches global state

### Platform Support
To add a new platform, update `PLATFORM_TO_IGDB_ID` in `backend/src/igdb.ts`. Platform folder names must exactly match the keys in this map.

### Path Aliases
Frontend uses `@/*` → `./src/*`. Always use this alias for imports inside `src/`.

### UI Components
- `src/components/ui/` contains **shadcn/ui generated components** — do not manually edit these; regenerate via shadcn CLI instead
- Use `lucide-react` for icons (already installed)
- Use `Shadcn` components library  
- Use `sonner` for toast notifications (already installed)

## Gotchas

- **Prisma schema location**: schema is at `backend/prisma/schema.prisma`; generated client is at `backend/src/generated/prisma/` (gitignored — run `prisma generate` after cloning)
- **Prisma migrations**: run `prisma migrate dev` from `backend/`; `prisma.config.ts` at the backend root configures the migrations path and datasource URL
- **Scanner removes orphans, not all rows**: `deleteOrphanedGames()` removes games whose folder no longer exists on disk; `clearGames()` (full wipe) is only used if no valid paths are found
- **IGDB failures are silent**: `igdb.ts` returns `null` on errors; the scanner falls back to local files gracefully
- **Download endpoint uses no compression** (`zlib level 0`): intentional, avoids CPU overhead on NAS for already-compressed game files
- **Frontend install**: use `npm install --legacy-peer-deps` due to React 19 peer dep conflicts
