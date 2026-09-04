/**
 * AI layer: pure logic, no DOM, no framework.
 *
 * Easy opponent: uniform random targeting over the cells it has not tried yet.
 * The hunt/target strategy behind the hard difficulty arrives in a later phase.
 */

import { BOARD_SIZE, hasBeenShot } from '../engine/index.js';

export const DIFFICULTIES = ['easy', 'hard'];

/**
 * @param {Array<object>} shots - Shots the opponent already fired.
 * @returns {Array<{ row: number, column: number }>} Cells still untouched.
 */
export function getAvailableTargets(shots) {
  const targets = [];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if (!hasBeenShot(shots, { row, column })) {
        targets.push({ row, column });
      }
    }
  }

  return targets;
}

/**
 * @param {Array<object>} shots
 * @param {() => number} [random]
 * @returns {{ row: number, column: number } | null} Null when the board is exhausted.
 */
export function chooseTarget(shots, random = Math.random) {
  const targets = getAvailableTargets(shots);

  if (targets.length === 0) {
    return null;
  }

  return targets[Math.floor(random() * targets.length)];
}
