# The renderer uses Next.js, but doesn't depend on it

Phoenix started from an electron-vite template and moved the renderer to Next.js three weeks later.
It was the author's first Electron and React project, and React's documentation recommended starting with a framework such as Next.js.
Electron needs no server, so production uses a static export loaded over an `app://` protocol, while development runs a Next dev server inside the main process.

## Consequences

- Next.js is replaceable, for example with Vite and React, as long as production still loads static files from the app bundle.
- Server-only Next.js features (API routes, server rendering, server actions) don't work in a static export; don't add them.
