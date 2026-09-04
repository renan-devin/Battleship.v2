# Debugging report

Running log of real bugs found while building the game, how they were detected and
how they were fixed. One section per phase.

## Phase 2 - placement engine and UI

### 1. `placeShipsRandomly` could recurse forever

- **Symptom:** the first implementation restarted itself with a recursive call after 500
  failed attempts for a single ship. With a deterministic random source (for example a test
  stub always returning the same value) no ship ever fits, so the function called itself
  endlessly and would blow the stack or hang the browser tab.
- **Detection:** review of the retry path while writing the unit test that injects a fixed
  random source.
- **Fix:** replaced the recursion with a bounded outer loop (`MAX_FLEET_ATTEMPTS`) that
  throws `Could not place the fleet randomly` when the random source cannot produce a valid
  fleet. Covered by `placeShipsRandomly > gives up instead of looping forever on a
degenerate random source`.

### 2. Moving an already placed ship reported a false overlap

- **Symptom:** re-placing a ship one cell to the side was rejected, because the ship
  collided with its own previous position.
- **Detection:** unit test `canPlaceShip > ignores the ship being moved when checking
overlap`.
- **Fix:** `canPlaceShip` filters out any existing placement with the same `shipId` before
  building the occupancy grid, so a ship never collides with itself.

### 3. Test suite imported constants from the wrong module

- **Symptom:** `TypeError: Cannot read properties of undefined (reading 'reduce')` in 15
  tests.
- **Detection:** `npm test`.
- **Fix:** `tests/placement.test.js` imported `BOARD_SIZE`, `FLEET` and `ORIENTATIONS` from
  `src/engine/placement.js`, which does not re-export them; the imports now come from
  `src/engine/constants.js`.

### 4. Invalid CSS custom property value

- **Symptom:** `--color-water-hover` was written as `#1f5float`, which is not a color, so
  the cell hover state silently fell back to the previous value.
- **Detection:** re-reading the design tokens after adding them.
- **Fix:** corrected the token to `#1f5b82` and used it in the `.cell:hover` rule.
