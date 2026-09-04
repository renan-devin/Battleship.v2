/**
 * UI layer: DOM rendering helpers.
 *
 * Renders board grids as native <button> elements so cells are focusable and
 * operable with the keyboard by default.
 */

import { BOARD_SIZE, buildOccupancyGrid, getShipCells } from '../engine/index.js';

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
 * Fills a container with a BOARD_SIZE x BOARD_SIZE grid of cell buttons.
 *
 * @param {HTMLElement} container - Element that receives the cells.
 * @param {string} boardName - Human readable board name used in cell labels.
 * @returns {HTMLButtonElement[]} The created cells, in row-major order.
 */
export function renderGrid(container, boardName) {
  const cells = [];
  container.replaceChildren();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
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
 * Paints ships and the placement preview on the player board.
 *
 * @param {HTMLButtonElement[]} cells - Cells returned by `renderGrid`.
 * @param {Array<object>} placements - Ships currently on the board.
 * @param {{ cells: Array<{row: number, column: number}>, valid: boolean }} [preview]
 */
export function paintPlayerBoard(cells, placements, preview) {
  const occupancy = buildOccupancyGrid(placements);
  const previewCells = new Set((preview?.cells ?? []).map(({ row, column }) => `${row}:${column}`));

  for (const cell of cells) {
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    const shipId = occupancy[row][column];
    const inPreview = previewCells.has(`${row}:${column}`);

    cell.classList.toggle('cell--ship', Boolean(shipId));
    cell.classList.toggle('cell--preview-valid', inPreview && preview.valid);
    cell.classList.toggle('cell--preview-invalid', inPreview && !preview.valid);

    if (shipId) {
      cell.dataset.shipId = shipId;
    } else {
      delete cell.dataset.shipId;
    }
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
