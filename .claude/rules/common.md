---
paths:
  - 'electron/common/**'
---

# Common (`electron/common/`)

- Common code runs in main (Node), preload and the renderer (browser).
  - It may not use Node built-ins, `Buffer`, `__dirname` or `process` (except `process.env`).
  - It may not import from `electron/main`, `electron/preload` or `electron/renderer`.
  - ESLint enforces both.
- The `types.ts` files are the contract between processes.
  - `electron/common/game/types.ts` defines game events and the IPC event payloads.
  - Changing a type here can break main, preload and renderer at once; typecheck all four projects.
- Imports are relative and end in `.js`, because main and common compile as NodeNext.
- Test mocks shared across processes live in `__mocks__/` folders here, such as the logger mock.
