/**
 * State layer: pure logic, no DOM, no framework.
 *
 * Orchestrates the engine for the placement phase: which ship is selected,
 * the current orientation and the placements made so far. Every function is
 * side-effect free and returns a new state object.
 */

import { FLEET, ORIENTATIONS, placeShip, placeShipsRandomly, removeShip } from '../engine/index.js';

/**
 * @returns {object} A fresh placement state with no ship on the board.
 */
export function createInitialState() {
  return {
    phase: 'placement',
    difficulty: 'easy',
    orientation: ORIENTATIONS.horizontal,
    selectedShipId: FLEET[0].id,
    placements: [],
  };
}

/**
 * @param {object} state
 * @returns {string[]} Ids of the ships still waiting to be placed.
 */
export function getRemainingShipIds(state) {
  const placedIds = new Set(state.placements.map((placement) => placement.shipId));
  return FLEET.filter((ship) => !placedIds.has(ship.id)).map((ship) => ship.id);
}

/**
 * @param {object} state
 * @returns {boolean} True when the whole fleet is on the board.
 */
export function isPlacementComplete(state) {
  return getRemainingShipIds(state).length === 0;
}

/**
 * Selects the ship the next click will place. Unknown ids are ignored.
 *
 * @param {object} state
 * @param {string} shipId
 * @returns {object}
 */
export function selectShip(state, shipId) {
  if (!FLEET.some((ship) => ship.id === shipId)) {
    return state;
  }

  return { ...state, selectedShipId: shipId };
}

/**
 * @param {object} state
 * @returns {object} State with the opposite orientation.
 */
export function toggleOrientation(state) {
  const orientation =
    state.orientation === ORIENTATIONS.horizontal ? ORIENTATIONS.vertical : ORIENTATIONS.horizontal;

  return { ...state, orientation };
}

/**
 * Places the selected ship and moves the selection to the next pending ship.
 *
 * @param {object} state
 * @param {{ row: number, column: number }} origin
 * @returns {object} New state, or the same state when the move is invalid.
 */
export function placeSelectedShip(state, origin) {
  if (!state.selectedShipId) {
    return state;
  }

  const placement = {
    shipId: state.selectedShipId,
    row: origin.row,
    column: origin.column,
    orientation: state.orientation,
  };

  let placements;

  try {
    placements = placeShip(state.placements, placement);
  } catch {
    return state;
  }

  const next = { ...state, placements };

  return { ...next, selectedShipId: getRemainingShipIds(next)[0] ?? null };
}

/**
 * Takes a ship off the board and selects it again.
 *
 * @param {object} state
 * @param {string} shipId
 * @returns {object}
 */
export function removePlacedShip(state, shipId) {
  if (!state.placements.some((placement) => placement.shipId === shipId)) {
    return state;
  }

  return { ...state, placements: removeShip(state.placements, shipId), selectedShipId: shipId };
}

/**
 * @param {object} state
 * @param {() => number} [random]
 * @returns {object} State with a full random fleet and nothing left to place.
 */
export function randomizePlacements(state, random) {
  return { ...state, placements: placeShipsRandomly(random), selectedShipId: null };
}

/**
 * @param {object} state
 * @returns {object} Empty board, keeping the chosen difficulty.
 */
export function resetPlacements(state) {
  return { ...createInitialState(), difficulty: state.difficulty };
}

/**
 * @param {object} state
 * @param {string} difficulty
 * @returns {object}
 */
export function setDifficulty(state, difficulty) {
  return { ...state, difficulty };
}
