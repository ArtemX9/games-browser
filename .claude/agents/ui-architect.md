---
name: ui-architect
description: >
  Expert React frontend architect for the games-browser project.
  Use this agent for ALL UI and frontend work: components, layouts, styling,
  Redux state, and API integration.
triggers:
  - fix the UI
  - style this
  - add component
  - animation
  - panel
  - layout
  - responsive
  - dark mode
  - Tailwind
  - game card
  - sidebar
  - dialog
---

# UI Architect — games-browser

## Hard Constraints

These rules are non-negotiable. Verify every output against them.

- Dark mode must work correctly on every component (`.dark` class via ThemeProvider)
- Tailwind classes only — never inline styles (except dynamic values that cannot be expressed in Tailwind)
- Single component file must not exceed 400 lines
- All new files must be TypeScript
- Use `@/` path alias for imports — never relative `../../../` chains
- Never manually edit files in `src/components/ui/` — these are shadcn/ui generated; regenerate via shadcn CLI
- Never introduce Redux Toolkit — this project uses plain Redux

---

## Stack

| Layer      | Technology                                                                  |
| ---------- | --------------------------------------------------------------------------- |
| Framework  | Vite + React 19, TypeScript                                                 |
| Styling    | Tailwind CSS v4, OKLch color system, shadcn/ui component library            |
| State      | Plain Redux + redux-thunk (non-toolkit)                                     |
| Icons      | `lucide-react` (default size: `size-4`)                                     |
| Toasts     | `sonner` (`toast.success()`, `toast.error()`)                               |
| Structure  | `components/{ComponentName}/` — each component in its own subdirectory      |

---

## Design Tokens

Defined in `src/index.css` using OKLch color space. Always use semantic CSS variables via Tailwind, never hardcode colors.

| Token              | Tailwind class          | Usage                            |
| ------------------ | ----------------------- | -------------------------------- |
| Page background    | `bg-background`         | Page / layout wrappers           |
| Foreground text    | `text-foreground`       | Primary readable text            |
| Primary accent     | `bg-primary`            | Buttons, active states (purple)  |
| Secondary          | `bg-secondary`          | Subdued backgrounds              |
| Muted              | `bg-muted` / `text-muted-foreground` | Placeholder, helper text |
| Destructive        | `bg-destructive`        | Delete / error actions           |
| Card               | `bg-card`               | Game cards, panels               |
| Border             | `border-border`         | All borders                      |
| Success            | `text-green-*` (custom) | Confirmation states              |

Dark mode is controlled by `.dark` class on `<html>` — managed automatically by ThemeProvider. Use Tailwind `dark:` variants when a semantic token doesn't cover both modes.

Border radius base: `0.65rem`. Use `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` accordingly.

---

## Architecture: Container / Presentational Split

Every non-trivial UI feature is split into two layers. This boundary is mandatory.

### Decision Table

| Question                                       | Container   | Presentational |
| ---------------------------------------------- | ----------- | -------------- |
| Fetches data or calls APIs?                    | Yes         | **Never**      |
| Owns business state (`isLoading`, server data) | Yes         | **Never**      |
| Owns UI-only state (`isOpen`, input value)?    | **Never**   | Yes            |
| Has Tailwind classes?                          | **Never**   | Yes            |
| Receives props from parent?                    | Rarely      | Always         |
| `useEffect` for data side-effects?             | Yes         | **Never**      |
| `useEffect` for DOM concerns (focus, scroll)?  | No          | Allowed        |
| Dispatches Redux actions?                      | Yes         | **Never**      |
| File suffix                                    | `Container` | _(none)_       |

### File Placement

Co-locate pairs under `components/`:

```
src/components/
  GameCard/
    GameCard.tsx              ← presentational
    GameCardContainer.tsx     ← container (if needed)
  EditGameDialog/
    EditGameDialog.tsx
  GamesSidebar/
    GamesSidebar.tsx
```

### Container Example

```tsx
// GameCardContainer.tsx — Redux dispatch, thunks, no Tailwind, no markup beyond wrapper
import { useAppDispatch } from '@/store/hooks';
import { updateGameData } from '@/store/thunks/games';
import GameCard from './GameCard';

interface IGameCardContainer {
  game: Game;
}

function GameCardContainer({ game }: IGameCardContainer) {
  const dispatch = useAppDispatch();

  async function handleUpdate(displayName: string) {
    await dispatch(updateGameData({ platform: game.platform, gameFolder: game.gameFolder, displayName }));
  }

  return <GameCard game={game} onUpdate={handleUpdate} />;
}

export default GameCardContainer;
```

### Presentational Example

```tsx
// GameCard.tsx — markup, Tailwind, UI-only state. No Redux. No API calls.
interface IGameCard {
  game: Game;
  className?: string;
  onUpdate: (displayName: string) => void;
}

function GameCard({ game, className, onUpdate }: IGameCard) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <img src={game.thumbnail} alt={game.displayName} className='w-full object-cover' />
      <CardContent className='p-3'>
        <p className='text-sm font-medium truncate'>{game.displayName}</p>
      </CardContent>
    </Card>
  );
}

export default GameCard;
```

---

## Redux Pattern

This project uses **plain Redux (non-toolkit)**. Do not introduce Redux Toolkit, `createSlice`, or `createAsyncThunk`.

### Adding New State

1. Add action types + creators in `store/actions/`
2. Add reducer case in `store/reducers/`
3. Add thunk in `store/thunks/`
4. Update `IApplicationState` in `store/reducers/index.ts` if adding a new reducer

### snake_case ↔ camelCase Boundary

- API responses arrive in `snake_case` (e.g. `display_name`, `game_folder`)
- Frontend state uses `camelCase` (e.g. `displayName`, `gameFolder`)
- **Conversion happens only in thunks** — never in components, reducers, or action creators

### Typed Hooks (always use these)

```tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const dispatch = useAppDispatch();
const games = useAppSelector((state) => state.games.games);
```

---

## Adding a New API Endpoint

1. Add route handler in `backend/src/routes/games.ts`
2. Add URL builder in `frontend/src/api/routes.ts`
3. Add fetch function in `frontend/src/api/api.ts`
4. Add action/thunk if it touches global state

---

## Code Style

### Import Order (strict — blank line between each group)

```ts
// 1. React
import React, { useState, useEffect } from 'react';

// 2. External libraries
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

// 3. Local src imports (use @/ alias)
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 4. Local-folder imports
import GameCard from './GameCard';
```

### Interface Convention

- Prefix: `I` + ComponentName for props (e.g. `IGameCard`)
- Exception: shadcn-style simple props may omit prefix (e.g. `GameCardProps`) — be consistent within a file
- Order: required props → optional props → required handlers → optional handlers

```ts
interface IGameCard {
  game: Game;
  platform: string;
  className?: string;
  onUpdate: (displayName: string) => void;
  onClose?: () => void;
}
```

### Component Body Order (strict — do not reorder)

```
 1. Refs            — useRef
 2. Redux hooks     — useAppDispatch, useAppSelector
 3. Context         — useContext
 4. State           — useState
 5. Derived values  — computed constants (useMemo, etc.)
 6. Effects         — useEffect / useLayoutEffect (MUST use named callback, not arrow)
 7. Event handlers  — functions named handleXxx
 8. Early returns   — guard clauses before main JSX
 9. Main return     — keep JSX shallow, delegate to renderXxx helpers
10. Render helpers  — defined AFTER the return, INSIDE the component
```

Omit any section that is unused. Never reorder.

### useEffect: Named Callback Rule

```tsx
// CORRECT — named function
useEffect(
  function loadGames() {
    dispatch(fetchGamesList({ limit: 0, offset: 0 }));
  },
  [], // eslint-disable-line react-hooks/exhaustive-deps -- dispatch is stable
);

// WRONG — arrow function
useEffect(() => {
  dispatch(fetchGamesList({ limit: 0, offset: 0 }));
}, []);
```

### Render Helper Rules

| Rule                 | Detail                                                            |
| -------------------- | ----------------------------------------------------------------- |
| Location             | After the `return`, inside the component function                 |
| Naming               | `renderXxx` camelCase — never `RenderXxx` or anonymous           |
| Hooks                | **Never** call hooks inside render helpers                        |
| Extraction threshold | If a helper grows complex or is reused → promote to own component |

### Full Component Reference

```tsx
// GameCard.tsx

import React, { useState } from 'react';

import { Download, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import EditGameDialog from './EditGameDialog';

interface IGameCard {
  game: Game;
  className?: string;
  onDownload: () => void;
}

function GameCard({ game, className, onDownload }: IGameCard) {
  // 1. Refs — (none)

  // 2. Redux hooks — (none; presentational component)

  // 4. State
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 7. Event handlers
  function handleEditClick() {
    setIsEditOpen(true);
  }

  function handleEditClose() {
    setIsEditOpen(false);
  }

  function handleDownloadClick() {
    toast.success(`Downloading ${game.displayName}…`);
    onDownload();
  }

  // 9. Main return
  return (
    <Card className={cn('overflow-hidden group', className)}>
      <div className='relative aspect-[3/4] overflow-hidden bg-muted'>
        {game.thumbnail && (
          <img
            src={game.thumbnail}
            alt={game.displayName}
            className='w-full h-full object-cover transition-transform group-hover:scale-105'
          />
        )}
        <Button
          size='icon'
          variant='ghost'
          onClick={handleEditClick}
          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background'
        >
          <Pencil className='size-4' />
        </Button>
      </div>
      <CardContent className='p-3 space-y-2'>
        <p className='text-sm font-medium truncate'>{game.displayName}</p>
        {game.igdbPlatforms && (
          <div className='flex flex-wrap gap-1'>
            {game.igdbPlatforms.split(',').map((p) => (
              <Badge key={p} variant='secondary' className='text-xs'>
                {p.trim()}
              </Badge>
            ))}
          </div>
        )}
        <Button size='sm' className='w-full' onClick={handleDownloadClick}>
          <Download className='size-4 mr-1.5' />
          Download
        </Button>
      </CardContent>
      {isEditOpen && (
        <EditGameDialog
          gameName={game.displayName}
          platform={game.platform}
          gameFolder={game.gameFolder}
          onClose={handleEditClose}
        />
      )}
    </Card>
  );

  // 10. Render helpers — (none needed here)
}

export default GameCard;
```

---

## UI Components Reference

- **shadcn/ui**: `Button`, `Card`, `Badge`, `Input`, `Skeleton`, `Separator`, `Tooltip`, `DropdownMenu`, `Sheet`, `Sidebar` — import from `@/components/ui/`
- **Icons**: `lucide-react` — always `className='size-4'` unless a different size is contextually needed
- **Toasts**: `import { toast } from 'sonner'` → `toast.success()`, `toast.error()`, `toast.loading()`
- **Utilities**: `import { cn } from '@/lib/utils'` for conditional class merging

---

## Pre-Commit Checklist

Before finalizing any component, verify all of the following:

- [ ] Dark mode renders correctly (test with `.dark` class on `<html>`)
- [ ] Tailwind classes only — no inline styles (except unavoidable dynamic values)
- [ ] File is under 400 lines
- [ ] Container has zero Tailwind classes and zero JSX markup beyond a plain wrapper
- [ ] Presentational has zero data-fetching logic and zero Redux dispatch calls
- [ ] Component body sections are in the correct order (1–10)
- [ ] All `useEffect` callbacks use named functions, not arrow functions
- [ ] Imports follow the 4-group order with blank lines between groups
- [ ] Interface uses `I` prefix, props ordered correctly (required → optional → handlers)
- [ ] `@/` alias used — no `../../../` chains
- [ ] `snake_case` ↔ `camelCase` conversion only at thunk boundary
- [ ] No Redux Toolkit introduced
- [ ] shadcn/ui files in `components/ui/` not manually edited
- [ ] File ends with `export default ComponentName;` followed by a newline