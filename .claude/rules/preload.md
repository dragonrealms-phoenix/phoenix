---
paths:
  - 'electron/preload/**'
---

# Preload (`electron/preload/`)

- `index.ts` builds `appAPI` and exposes it to the renderer as `window.api`.
- Preload compiles to CommonJS on its own, because the sandboxed renderer can't load ES modules.
- Import only types from `electron/common`, so no runtime code is bundled across.
- `index.d.ts` is generated from `index.ts` and committed (decision 0002).
  - After any change to `index.ts`, run `yarn build:preload` and commit both files.
  - Never edit `index.d.ts` by hand.
- `onMessage(channel, callback)` returns the function that unsubscribes that one callback.
- `removeAllListeners(channel)` removes every listener on the channel, including other components'.
- Tests are in `electron/preload/__tests__/index.test.ts`.
- Adding a channel also touches main; the steps are in the main rules under IPC.
