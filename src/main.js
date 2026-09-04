/**
 * Entry point: wires a full match between state, engine and DOM.
 *
 * Deployment happens on the left board, combat on the right one. The enemy
 * replies on its own after a short delay so the player can read the outcome.
 */

import { ORIENTATIONS, canPlaceShip, getShipDefinition } from './engine/index.js';
import {
  createInitialState,
  fireAtEnemy,
  fireAtPlayer,
  isBattleActive,
  isGameOver,
  isPlacementComplete,
  placeSelectedShip,
  randomizePlacements,
  removePlacedShip,
  resetPlacements,
  selectShip,
  setDifficulty,
  startBattle,
  startNewGame,
  toggleOrientation,
} from './state/index.js';
import {
  formatCoordinate,
  getPreviewCells,
  paintEnemyBoard,
  paintPlayerBoard,
  renderGrid,
} from './ui/board.js';
import { paintFleetRoster, renderFleetRoster } from './ui/fleet.js';

const ENEMY_TURN_DELAY_MS = 700;

function mount() {
  const playerBoard = document.querySelector('#player-board');
  const enemyBoard = document.querySelector('#enemy-board');
  const fleetRoster = document.querySelector('#fleet-roster');
  const enemyRoster = document.querySelector('#enemy-roster');
  const statusMessage = document.querySelector('#status-message');
  const turnIndicator = document.querySelector('#turn-indicator');
  const fleetHint = document.querySelector('#fleet-hint');
  const orientationButton = document.querySelector('#orientation');
  const randomButton = document.querySelector('#random');
  const resetButton = document.querySelector('#reset');
  const startButton = document.querySelector('#start-battle');
  const difficultySelect = document.querySelector('#difficulty');
  const result = document.querySelector('#result');
  const resultTitle = document.querySelector('#result-title');
  const resultDetail = document.querySelector('#result-detail');

  if (!playerBoard || !enemyBoard || !fleetRoster || !enemyRoster) {
    return;
  }

  const playerCells = renderGrid(playerBoard, 'Your waters');
  const enemyCells = renderGrid(enemyBoard, 'Enemy waters');
  const shipRows = renderFleetRoster(fleetRoster);
  const enemyShipRows = renderFleetRoster(enemyRoster, { interactive: false });

  let state = createInitialState();
  let hoveredCell = null;
  let enemyTurnTimer = null;

  function announce(message) {
    if (statusMessage) {
      statusMessage.textContent = message;
    }
  }

  function currentPreview() {
    if (state.phase !== 'placement' || !hoveredCell || !state.selectedShipId) {
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

  function renderControls() {
    const placing = state.phase === 'placement';

    if (orientationButton) {
      const horizontal = state.orientation === ORIENTATIONS.horizontal;
      orientationButton.textContent = `Orientation: ${horizontal ? 'Horizontal' : 'Vertical'}`;
      orientationButton.setAttribute('aria-pressed', String(!horizontal));
      orientationButton.disabled = !placing;
    }

    if (randomButton) {
      randomButton.disabled = !placing;
    }

    if (resetButton) {
      resetButton.disabled = !placing;
    }

    if (startButton) {
      startButton.disabled = !placing || !isPlacementComplete(state);
      startButton.hidden = !placing;
    }

    if (difficultySelect) {
      difficultySelect.disabled = !placing;
    }

    if (fleetHint) {
      fleetHint.hidden = !placing;
    }
  }

  function renderTurn() {
    if (!turnIndicator) {
      return;
    }

    const labels = {
      placement: 'Deployment',
      battle: state.turn === 'player' ? 'Your turn' : 'Enemy turn',
      victory: 'Victory',
      defeat: 'Defeat',
    };

    turnIndicator.textContent = labels[state.phase];
    turnIndicator.dataset.phase = state.phase;
    turnIndicator.dataset.turn = state.turn ?? '';
  }

  function renderResult() {
    if (!result) {
      return;
    }

    const wasHidden = result.hidden;
    result.hidden = !isGameOver(state);

    if (!isGameOver(state)) {
      return;
    }

    if (wasHidden) {
      document.querySelector('#result-restart')?.focus();
    }

    const victory = state.phase === 'victory';
    resultTitle.textContent = victory ? 'Enemy fleet destroyed' : 'Your fleet is lost';
    resultDetail.textContent = victory
      ? `You sank every enemy ship in ${state.playerShots.length} shots.`
      : `The enemy sank your fleet in ${state.enemyShots.length} shots.`;
  }

  function render() {
    const placing = state.phase === 'placement';

    paintPlayerBoard(playerCells, state.placements, {
      preview: currentPreview(),
      shots: state.enemyShots,
    });
    paintEnemyBoard(enemyCells, state.enemyPlacements, state.playerShots, isBattleActive(state));
    paintFleetRoster(shipRows, {
      placements: state.placements,
      shots: state.enemyShots,
      selectedShipId: state.selectedShipId,
      showPlacement: placing,
    });
    paintFleetRoster(enemyShipRows, {
      placements: state.enemyPlacements,
      shots: state.playerShots,
    });

    renderControls();
    renderTurn();
    renderResult();
  }

  function update(nextState, message) {
    state = nextState;
    render();

    if (message) {
      announce(message);
    }
  }

  function describeShot(shot) {
    const coordinate = formatCoordinate(shot.row, shot.column);
    const attacker = shot.by === 'player' ? 'You' : 'The enemy';

    if (shot.sunkShipId) {
      const owner = shot.by === 'player' ? 'Enemy' : 'Your';
      return `${attacker} sank the ${owner} ${getShipDefinition(shot.sunkShipId).name} at ${coordinate}.`;
    }

    return `${attacker} ${shot.result === 'hit' ? 'hit' : 'missed'} at ${coordinate}.`;
  }

  function scheduleEnemyTurn() {
    clearTimeout(enemyTurnTimer);
    enemyTurnTimer = setTimeout(() => {
      const nextState = fireAtPlayer(state);

      if (nextState === state) {
        return;
      }

      update(nextState, describeShot(nextState.lastShot));
    }, ENEMY_TURN_DELAY_MS);
  }

  function handlePlacementClick(row, column, shipId) {
    if (shipId) {
      const definition = getShipDefinition(shipId);
      update(removePlacedShip(state, shipId), `${definition.name} removed. Place it again.`);
      return;
    }

    if (!state.selectedShipId) {
      announce('All ships are placed. Click a ship on the board to move it, or start the battle.');
      return;
    }

    const definition = getShipDefinition(state.selectedShipId);
    const nextState = placeSelectedShip(state, { row, column });

    if (nextState === state) {
      announce(`${definition.name} does not fit at ${formatCoordinate(row, column)}.`);
      return;
    }

    const message = isPlacementComplete(nextState)
      ? 'Fleet ready. Start the battle when you are.'
      : `${definition.name} placed at ${formatCoordinate(row, column)}.`;

    update(nextState, message);
  }

  playerBoard.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');

    if (!cell || state.phase !== 'placement') {
      return;
    }

    handlePlacementClick(
      Number(cell.dataset.row),
      Number(cell.dataset.column),
      cell.dataset.shipId,
    );
  });

  enemyBoard.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');

    if (!cell || !isBattleActive(state)) {
      return;
    }

    if (state.turn !== 'player') {
      announce('Hold fire: the enemy is taking its turn.');
      return;
    }

    const target = { row: Number(cell.dataset.row), column: Number(cell.dataset.column) };
    const nextState = fireAtEnemy(state, target);

    if (nextState === state) {
      announce(`You already fired at ${formatCoordinate(target.row, target.column)}.`);
      return;
    }

    update(nextState, describeShot(nextState.lastShot));

    if (isBattleActive(nextState)) {
      scheduleEnemyTurn();
    }
  });

  function trackHover(event) {
    const cell = event.target.closest('.cell');

    if (cell) {
      hoveredCell = { row: Number(cell.dataset.row), column: Number(cell.dataset.column) };
      render();
    }
  }

  playerBoard.addEventListener('pointerover', trackHover);
  playerBoard.addEventListener('focusin', trackHover);

  playerBoard.addEventListener('pointerleave', () => {
    hoveredCell = null;
    render();
  });

  fleetRoster.addEventListener('click', (event) => {
    const button = event.target.closest('.ship');

    if (!button || state.phase !== 'placement') {
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

  function rotate() {
    if (state.phase !== 'placement') {
      return;
    }

    const nextState = toggleOrientation(state);
    const horizontal = nextState.orientation === ORIENTATIONS.horizontal;
    update(nextState, `Orientation set to ${horizontal ? 'horizontal' : 'vertical'}.`);
  }

  orientationButton?.addEventListener('click', rotate);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'r' && event.key !== 'R') {
      return;
    }

    const target = event.target;

    if (target instanceof HTMLSelectElement || target instanceof HTMLInputElement) {
      return;
    }

    rotate();
  });

  randomButton?.addEventListener('click', () => {
    update(randomizePlacements(state), 'Fleet placed randomly. Start the battle when you are.');
  });

  resetButton?.addEventListener('click', () => {
    update(resetPlacements(state), 'Board cleared. Place your fleet.');
  });

  startButton?.addEventListener('click', () => {
    const nextState = startBattle(state);

    if (nextState === state) {
      announce('Place your whole fleet before starting the battle.');
      return;
    }

    update(nextState, 'Battle stations. Fire at the enemy waters.');
  });

  function newGame() {
    clearTimeout(enemyTurnTimer);
    update(startNewGame(state), 'New game. Place your fleet.');
  }

  document.querySelector('#new-game')?.addEventListener('click', newGame);
  document.querySelector('#result-restart')?.addEventListener('click', newGame);

  difficultySelect?.addEventListener('change', (event) => {
    update(setDifficulty(state, event.target.value), `Difficulty set to ${event.target.value}.`);
  });

  render();
  announce('Place your fleet: select a ship, press R to rotate and click a cell.');
}

mount();
