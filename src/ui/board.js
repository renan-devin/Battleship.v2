/**
 * UI layer: DOM rendering helpers.
 *
 * Renders board grids as native <button> elements so cells are focusable and
 * operable with the keyboard by default.
 */

import { BOARD_SIZE } from '../engine/index.js';

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
      cell.setAttribute(
        'aria-label',
        `${boardName} cell ${String.fromCharCode(65 + column)}${row + 1}`,
      );
      container.append(cell);
      cells.push(cell);
    }
  }

  return cells;
}
