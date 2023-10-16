# About

This folder contains code shared between the `main` and `renderer` processes.

# Node Integration

Common code cannot use any Node APIs like `fs`, `path`, or `process` because
node integration is not enabled in the `renderer` process per security best practices.

# Bundling

This folder does not contain its own `tsconfig.json` because it is not compiled independently.
It is bundled with the `main` and `renderer` processes separately and tree shaking removes
from each's bundle the code that is not used.
