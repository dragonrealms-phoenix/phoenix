# About

This folder contains code shared between the `main` and `renderer` processes.

# Node Integration

Common code cannot use any Node APIs like `fs`, `path`, or `process` because
node integration is not enabled in the `renderer` process per security best practices.
