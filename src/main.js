/**
 * Entry point: mounts the base UI from the existing DOM.
 *
 * No game logic yet; it only renders the two empty grids.
 */

import { renderGrid } from './ui/board.js';

function mount() {
  const playerBoard = document.querySelector('#player-board');
  const enemyBoard = document.querySelector('#enemy-board');

  if (playerBoard) {
    renderGrid(playerBoard, 'Player board');
  }

  if (enemyBoard) {
    renderGrid(enemyBoard, 'Enemy board');
  }
}

mount();
