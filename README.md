# Battleship.v2

Browser implementation of the classic Battleship game, built with vanilla JavaScript
(ES modules) and Vite.

This repository currently contains the project foundation and a static, navigable UI:
two 10x10 grids, native button controls and a difficulty selector. No game logic yet.

## Requirements

- Node.js 18.18 or newer
- npm 9 or newer

## Getting started

```bash
npm install
```

## Scripts

| Script                 | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the Vite development server with hot reload.      |
| `npm run build`        | Build the production bundle into `dist/`.               |
| `npm run preview`      | Serve the production build locally.                     |
| `npm test`             | Run the Vitest test suite once.                         |
| `npm run lint`         | Lint the project with ESLint.                           |
| `npm run format`       | Format the project with Prettier.                       |
| `npm run format:check` | Check formatting with Prettier without writing changes. |

## Project structure

```
src/
  engine/   Game rules and board logic (pure logic, no DOM)
  ai/       Opponent strategies (pure logic, no DOM)
  state/    Orchestration between engine, AI and UI (pure logic, no DOM)
  ui/       DOM rendering helpers
  main.js   Entry point that mounts the base UI
tests/      Vitest test suite
```
