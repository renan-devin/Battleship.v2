/**
 * UI layer: DOM rendering helpers.
 *
 * Renders board grids as native <button> elements so cells are focusable and
 * operable with the keyboard by default, framed by A-J / 1-10 coordinates.
 */

import {
  BOARD_SIZE,
  buildOccupancyGrid,
  getShipCells,
  getShipDefinition,
  getSunkShipIds,
  ORIENTATIONS,
} from '../engine/index.js';

const COLUMN_LETTERS = 'ABCDEFGHIJ';

/**
 * @param {number} row
 * @param {number} column
 * @returns {string} Human readable coordinate such as "C4".
 */
export function formatCoordinate(row, column) {
  return `${COLUMN_LETTERS[column]}${row + 1}`;
}

/**
 * Fills a container with the coordinate ruler and a BOARD_SIZE x BOARD_SIZE
 * grid of cell buttons.
 *
 * @param {HTMLElement} container - Element that receives the grid.
 * @param {string} boardName - Human readable board name used in cell labels.
 * @returns {HTMLButtonElement[]} The created cells, in row-major order.
 */
export function renderGrid(container, boardName) {
  const cells = [];
  container.replaceChildren();
  container.append(createLabel('board__corner', ''));

  for (let column = 0; column < BOARD_SIZE; column += 1) {
    container.append(createLabel('board__label', COLUMN_LETTERS[column]));
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    container.append(createLabel('board__label', String(row + 1)));

    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.row = String(row);
      cell.dataset.column = String(column);
      cell.setAttribute('aria-label', `${boardName} cell ${formatCoordinate(row, column)}`);
      container.append(cell);
      cells.push(cell);
    }
  }

  return cells;
}

/**
 * Paints ships, incoming fire and the placement preview on the player board.
 *
 * @param {HTMLButtonElement[]} cells - Cells returned by `renderGrid`.
 * @param {Array<object>} placements - Ships currently on the board.
 * @param {object} [options]
 * @param {{ cells: Array<{row: number, column: number}>, valid: boolean }} [options.preview]
 * @param {Array<object>} [options.shots] - Shots the enemy fired at this board.
 */
export function paintPlayerBoard(cells, placements, options = {}) {
  const { preview, shots = [] } = options;
  const occupancy = buildOccupancyGrid(placements);
  const shipParts = buildShipParts(placements);
  const shotsByCell = indexShots(shots);
  const sunkIds = new Set(getSunkShipIds(placements, shots));
  const previewCells = new Set((preview?.cells ?? []).map(({ row, column }) => `${row}:${column}`));

  for (const cell of cells) {
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    const key = `${row}:${column}`;
    const shipId = occupancy[row][column];
    const shot = shotsByCell.get(key);
    const inPreview = previewCells.has(key);

    cell.classList.toggle('cell--ship', Boolean(shipId));
    cell.classList.toggle('cell--preview-valid', inPreview && preview.valid);
    cell.classList.toggle('cell--preview-invalid', inPreview && !preview.valid);
    cell.classList.toggle('cell--hit', Boolean(shot?.hit));
    cell.classList.toggle('cell--miss', Boolean(shot) && !shot.hit);
    cell.classList.toggle('cell--sunk', Boolean(shipId) && sunkIds.has(shipId));

    if (shipId) {
      cell.dataset.shipId = shipId;
      cell.dataset.shipPart = shipParts.get(key);
    } else {
      delete cell.dataset.shipId;
      delete cell.dataset.shipPart;
    }

    cell.setAttribute(
      'aria-label',
      `Your fleet cell ${formatCoordinate(row, column)}${describeCell(shipId, shot, sunkIds)}`,
    );
  }
}

/**
 * Paints the player's shots on the enemy board. Ships stay hidden until sunk.
 *
 * @param {HTMLButtonElement[]} cells - Cells returned by `renderGrid`.
 * @param {Array<object>} placements - Enemy ships, used only to reveal sunk ones.
 * @param {Array<object>} shots - Shots the player fired at this board.
 * @param {boolean} inBattle - Untouched cells only accept fire during the battle.
 */
export function paintEnemyBoard(cells, placements, shots, inBattle) {
  const shotsByCell = indexShots(shots);
  const sunkIds = new Set(getSunkShipIds(placements, shots));
  const occupancy = buildOccupancyGrid(placements);

  for (const cell of cells) {
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    const shot = shotsByCell.get(`${row}:${column}`);
    const shipId = occupancy[row][column];
    const sunk = Boolean(shipId) && sunkIds.has(shipId);

    cell.classList.toggle('cell--hit', Boolean(shot?.hit));
    cell.classList.toggle('cell--miss', Boolean(shot) && !shot.hit);
    cell.classList.toggle('cell--sunk', sunk);
    cell.disabled = !inBattle || Boolean(shot);

    cell.setAttribute(
      'aria-label',
      `Enemy waters cell ${formatCoordinate(row, column)}${describeCell(null, shot, sunkIds)}`,
    );
  }
}

/**
 * Cells a candidate placement would occupy, clipped to nothing when the ship
 * would leave the board on the right or bottom edge.
 *
 * @param {{ shipId: string, row: number, column: number, orientation: string }} placement
 * @returns {Array<{ row: number, column: number }>}
 */
export function getPreviewCells(placement) {
  return getShipCells(placement).filter(
    ({ row, column }) => row < BOARD_SIZE && column < BOARD_SIZE,
  );
}

function describeCell(shipId, shot, sunkIds) {
  if (shot?.hit) {
    const hitShipId = shot.shipId;
    const suffix = hitShipId && sunkIds.has(hitShipId) ? ', sunk' : '';
    return `: hit${suffix}`;
  }

  if (shot) {
    return ': miss';
  }

  return shipId ? `: ${getShipDefinition(shipId).name}` : '';
}

function indexShots(shots) {
  return new Map(shots.map((shot) => [`${shot.row}:${shot.column}`, shot]));
}

/**
 * Maps each occupied cell to bow, hull or stern so the CSS can round the ends
 * of a ship instead of drawing a chain of identical squares.
 */
function buildShipParts(placements) {
  const parts = new Map();

  for (const placement of placements) {
    const cells = getShipCells(placement);
    const axis = placement.orientation === ORIENTATIONS.horizontal ? 'h' : 'v';

    cells.forEach(({ row, column }, index) => {
      const position = index === 0 ? 'bow' : index === cells.length - 1 ? 'stern' : 'hull';
      parts.set(`${row}:${column}`, `${axis}-${position}`);
    });
  }

  return parts;
}

function createLabel(className, text) {
  const label = document.createElement('span');
  label.className = className;
  label.setAttribute('aria-hidden', 'true');
  label.textContent = text;
  return label;
}
