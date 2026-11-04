---
paths:
  - 'electron/renderer/**'
---

# Renderer (`electron/renderer/`)

Next.js 15 with React 18, Elastic UI (`@elastic/eui`) and Emotion, exported as static files (decision 0004).

## Structure

- `pages/index.tsx` is the start screen, and `pages/game.tsx` is the game screen.
- Folders depend downward: `pages` → `components` → `hooks` and `context` → `lib` and `types` → `electron/common`.
- The renderer may not import `electron/main` or `electron/preload`; ESLint enforces this.
- Code calls main through `window.api`, typed by `electron/preload/index.d.ts`.
  - Wrap new calls in a hook in `hooks/`, like `hooks/accounts.tsx`, `hooks/characters.tsx` and `hooks/layouts.tsx`.

## Game data flow

- `context/game.tsx` (`GameProvider`) is the only subscriber to `window.api.onMessage`.
- It republishes each event on the pub/sub store in `hooks/pubsub.tsx`.
- Components listen with `useSubscribe('game:event', ...)`.
- To add an event type, add it to `types/pubsub.types.ts` and to the `PubSubSubscriber` type in `hooks/pubsub.tsx`.
- Every subscription in a `useEffect` must return its unsubscribe function.
- `pages/game.tsx` turns text events into log lines for the stream windows in `components/game/game-stream.tsx`.
- Code here still calls stream windows "grid items" (`GridItem*`, `itemId`); the glossary term is stream window.

## Testing

Vitest runs in Node with no DOM, so components and hooks have no tests.
Put logic you want tested in `lib/`, or in `electron/common` if main needs it too.
