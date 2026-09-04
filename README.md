# Battleship.v2

Browser implementation of the classic Battleship game, built with vanilla JavaScript
(ES modules) and Vite.

The game currently covers the placement phase: pick a ship from the fleet roster, press
`R` (or the orientation button) to rotate it and click a cell on your board to deploy it.
`Random` deploys the whole fleet, `Reset` clears the board and clicking a placed ship takes
it back. Firing at the enemy board is not implemented yet.

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
  main.js   Entry point that wires state, engine and DOM
tests/      Vitest test suite
docs/       Debugging report
```

## Placement rules

Ships must stay inside the board, must not overlap and can only be placed horizontally or
vertically. Ships may touch each other, side by side or diagonally.
