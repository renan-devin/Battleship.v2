/**
 * Entry point: wires the placement phase between state, engine and DOM.
 *
 * Firing at the enemy board is not implemented yet.
 */

import { ORIENTATIONS, canPlaceShip, getShipDefinition } from './engine/index.js';
import {
  createInitialState,
  isPlacementComplete,
  placeSelectedShip,
  randomizePlacements,
  removePlacedShip,
  resetPlacements,
  selectShip,
  setDifficulty,
  toggleOrientation,
} from './state/index.js';
import { formatCoordinate, getPreviewCells, paintPlayerBoard, renderGrid } from './ui/board.js';
import { paintFleetRoster, renderFleetRoster } from './ui/fleet.js';

function mount() {
  const playerBoard = document.querySelector('#player-board');
  const enemyBoard = document.querySelector('#enemy-board');
  const fleetRoster = document.querySelector('#fleet-roster');
  const statusMessage = document.querySelector('#status-message');
  const orientationButton = document.querySelector('#orientation');
  const difficultySelect = document.querySelector('#difficulty');

  if (!playerBoard || !enemyBoard || !fleetRoster) {
    return;
  }

  const playerCells = renderGrid(playerBoard, 'Player board');
  renderGrid(enemyBoard, 'Enemy board');
  const shipButtons = renderFleetRoster(fleetRoster);

  let state = createInitialState();
  let hoveredCell = null;

  function announce(message) {
    if (statusMessage) {
      statusMessage.textContent = message;
    }
  }

  function currentPreview() {
    if (!hoveredCell || !state.selectedShipId) {
      return undefined;
    }

    const placement = {
      shipId: state.selectedShipId,
      row: hoveredCell.row,
      column: hoveredCell.column,
      orientation: state.orientation,
    };

    return {
      cells: getPreviewCells(placement),
      valid: canPlaceShip(state.placements, placement),
    };
  }

  function render() {
    paintPlayerBoard(playerCells, state.placements, currentPreview());
    paintFleetRoster(shipButtons, state);

    if (orientationButton) {
      const horizontal = state.orientation === ORIENTATIONS.horizontal;
      orientationButton.textContent = `Orientation: ${horizontal ? 'Horizontal' : 'Vertical'}`;
      orientationButton.setAttribute('aria-pressed', String(!horizontal));
    }
  }

  function update(nextState, message) {
    state = nextState;
    render();

    if (message) {
      announce(message);
    }
  }

  playerBoard.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');

    if (!cell) {
      return;
    }

    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    const shipId = cell.dataset.shipId;

    if (shipId) {
      const definition = getShipDefinition(shipId);
      update(removePlacedShip(state, shipId), `${definition.name} removed. Place it again.`);
      return;
    }

    if (!state.selectedShipId) {
      announce('All ships are placed. Select a ship on the board to move it.');
      return;
    }

    const definition = getShipDefinition(state.selectedShipId);
    const nextState = placeSelectedShip(state, { row, column });

    if (nextState === state) {
      announce(`${definition.name} does not fit at ${formatCoordinate(row, column)}.`);
      return;
    }

    const message = isPlacementComplete(nextState)
      ? 'Fleet ready. All ships are placed.'
      : `${definition.name} placed at ${formatCoordinate(row, column)}.`;

    update(nextState, message);
  });

  playerBoard.addEventListener('pointerover', (event) => {
    const cell = event.target.closest('.cell');

    if (cell) {
      hoveredCell = { row: Number(cell.dataset.row), column: Number(cell.dataset.column) };
      render();
    }
  });

  playerBoard.addEventListener('focusin', (event) => {
    const cell = event.target.closest('.cell');

    if (cell) {
      hoveredCell = { row: Number(cell.dataset.row), column: Number(cell.dataset.column) };
      render();
    }
  });

  playerBoard.addEventListener('pointerleave', () => {
    hoveredCell = null;
    render();
  });

  fleetRoster.addEventListener('click', (event) => {
    const button = event.target.closest('.ship');

    if (!button) {
      return;
    }

    const shipId = button.dataset.shipId;
    const definition = getShipDefinition(shipId);
    const placed = state.placements.some((placement) => placement.shipId === shipId);
    const nextState = placed ? removePlacedShip(state, shipId) : selectShip(state, shipId);

    update(
      nextState,
      placed
        ? `${definition.name} removed. Place it again.`
        : `${definition.name} selected. Choose a cell on your board.`,
    );
  });

  orientationButton?.addEventListener('click', () => {
    const nextState = toggleOrientation(state);
    const horizontal = nextState.orientation === ORIENTATIONS.horizontal;
    update(nextState, `Orientation set to ${horizontal ? 'horizontal' : 'vertical'}.`);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
      const target = event.target;

      if (target instanceof HTMLSelectElement || target instanceof HTMLInputElement) {
        return;
      }

      const nextState = toggleOrientation(state);
      const horizontal = nextState.orientation === ORIENTATIONS.horizontal;
      update(nextState, `Orientation set to ${horizontal ? 'horizontal' : 'vertical'}.`);
    }
  });

  document.querySelector('#random')?.addEventListener('click', () => {
    update(randomizePlacements(state), 'Fleet placed randomly.');
  });

  document.querySelector('#reset')?.addEventListener('click', () => {
    update(resetPlacements(state), 'Board cleared. Place your fleet.');
  });

  document.querySelector('#new-game')?.addEventListener('click', () => {
    update(resetPlacements(state), 'New game. Place your fleet.');
  });

  difficultySelect?.addEventListener('change', (event) => {
    update(setDifficulty(state, event.target.value), `Difficulty set to ${event.target.value}.`);
  });

  render();
  announce('Place your fleet: select a ship, press R to rotate and click a cell.');
}

mount();
