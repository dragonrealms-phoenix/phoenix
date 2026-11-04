# Phoenix

Desktop client for DragonRealms, built with Electron, React and TypeScript.

@glossary/GLOSSARY-MAP.md

## Layout

| Folder               | Runs in                      | Holds                                            |
| -------------------- | ---------------------------- | ------------------------------------------------ |
| `electron/main/`     | Node, Electron main process  | SGE login, game socket and parser, settings, IPC |
| `electron/preload/`  | Bridge to the sandboxed page | `window.api`, the renderer's only way to main    |
| `electron/renderer/` | Browser                      | Next.js UI                                       |
| `electron/common/`   | All three                    | Shared types and utilities                       |

- ESLint enforces the boundaries between these folders and the layers inside `electron/main/`.
- Each folder's rules in `.claude/rules/` load automatically when you read a file in that folder, so don't open them yourself.
- `.claude/decisions/` explains choices that look wrong but are deliberate; read it before "fixing" one.

## Commands

| Goal                     | Command                                                           | Notes                                                                            |
| ------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Run all tests            | `yarn test`                                                       | About 4s.                                                                        |
| Run one file or test     | `yarn test <path> -t "<test name>"`                               |                                                                                  |
| Typecheck                | `yarn tsc -p electron/<main\|preload\|renderer\|common> --noEmit` | There is no root tsconfig; check each project you touched.                       |
| Lint                     | `yarn lint`                                                       | About 10s. CI runs it too.                                                       |
| Regenerate preload types | `yarn build:preload`                                              | Required after any change to `electron/preload/index.ts`.                        |
| Run the app              | `yarn start:dev`                                                  | Opens a real window on real user data; restart it after main or preload changes. |
| Build for production     | `yarn build`                                                      | `yarn start` builds, then runs it. Only CI uploads source maps to Sentry.        |

- Setup needs Node from `.nvmrc`, Yarn via `corepack enable`, and a `.env` copied from `.env.example`.
- Ruby is needed only at runtime, for Lich.

## Tests

- Vitest runs in Node with globals off, so import `describe`, `it`, `expect` and `vi` from `vitest`.
- Tests live in `__tests__/<name>.test.ts` next to the code.
- Mocks are hand-written classes in `__mocks__/<name>.mock.ts`, wired in with `vi.mock()` and `vi.hoisted()`; they are not vitest automocks.
- A change to a module usually changes its `types.ts` and its test too.

## Commits

- Use Conventional Commits, as `type(scope): lowercase subject`; commitlint enforces it.
- The scope is the kebab-case module name, such as `feat(game-parser): ...`.
- Pushing to main releases automatically, and `chore` and `refactor` commits count as patch releases.

# Questions

Look up facts in the repo, git history, or the web yourself; ask me only for decisions.
When asking questions, use the `AskUserQuestion` tool.
Make each question stand on its own; I shouldn't need the transcript to answer it.
Lead with your recommended answer.
For each proposed answer, include the tradeoffs.

# Code Comments

After every code comment you write, ask yourself, "Is this information the next agent would spend multiple tool calls trying to understand?"
If the answer isn't clearly yes, the code comment is noise - delete it.

# Fix, Don't Warn

When something is broken or has a trap, propose the fix that removes it, not a rule for working around it.
If you're about to write "don't run X" or "use Y instead of X", fix X or propose the fix and ask.
Offer a workaround only when the fix is out of reach, and say why.

# Know Why Before Changing

Before proposing a change to existing code, find out how and why it got that way.
The reason may live only in a commit message or PR, not in a decision record or code comment.
