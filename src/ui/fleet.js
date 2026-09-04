/**
 * UI layer: fleet roster rendering.
 *
 * The roster doubles as ship selector during placement and as damage report
 * during the battle: pips light up as a ship takes hits and the row is marked
 * when it sinks.
 */

import { FLEET, getShipHitCount, getSunkShipIds } from '../engine/index.js';

/**
 * Creates one row per ship in the fleet.
 *
 * @param {HTMLElement} container
 * @param {{ interactive?: boolean }} [options] - Non-interactive rosters render as plain rows.
 * @returns {HTMLElement[]} The created rows, in fleet order.
 */
export function renderFleetRoster(container, options = {}) {
  const { interactive = true } = options;
  container.replaceChildren();

  return FLEET.map((ship) => {
    const row = document.createElement(interactive ? 'button' : 'div');
    row.className = 'ship';
    row.dataset.shipId = ship.id;

    if (interactive) {
      row.type = 'button';
    }

    row.append(
      createSpan('ship__name', ship.name),
      createShipPips(ship.size),
      createSpan('ship__status', ''),
    );
    container.append(row);
    return row;
  });
}

/**
 * Reflects selection, placement status and battle damage on a roster.
 *
 * @param {HTMLElement[]} rows
 * @param {object} options
 * @param {Array<object>} options.placements - Ships owned by the roster's side.
 * @param {Array<object>} [options.shots] - Shots fired at those ships.
 * @param {string|null} [options.selectedShipId]
 * @param {boolean} [options.showPlacement] - Show Placed/Pending instead of damage.
 */
export function paintFleetRoster(rows, options) {
  const { placements, shots = [], selectedShipId = null, showPlacement = false } = options;
  const placedIds = new Set(placements.map((placement) => placement.shipId));
  const sunkIds = new Set(getSunkShipIds(placements, shots));

  for (const row of rows) {
    const shipId = row.dataset.shipId;
    const placed = placedIds.has(shipId);
    const selected = selectedShipId === shipId;
    const sunk = sunkIds.has(shipId);
    const hits = getShipHitCount(placements, shots, shipId);

    row.classList.toggle('ship--placed', placed);
    row.classList.toggle('ship--selected', selected);
    row.classList.toggle('ship--sunk', sunk);

    if (row.tagName === 'BUTTON') {
      row.setAttribute('aria-pressed', String(selected));
    }

    row.querySelector('.ship__status').textContent = showPlacement
      ? statusForPlacement(placed)
      : statusForBattle(sunk, hits, row.querySelectorAll('.ship__pip').length);

    row.querySelectorAll('.ship__pip').forEach((pip, index) => {
      pip.classList.toggle('ship__pip--hit', !showPlacement && index < hits);
    });
  }
}

function statusForPlacement(placed) {
  return placed ? 'Placed' : 'Pending';
}

function statusForBattle(sunk, hits, size) {
  return sunk ? 'Sunk' : `${hits}/${size}`;
}

function createSpan(className, text) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

function createShipPips(size) {
  const pips = document.createElement('span');
  pips.className = 'ship__pips';
  pips.setAttribute('aria-hidden', 'true');

  for (let index = 0; index < size; index += 1) {
    const pip = document.createElement('span');
    pip.className = 'ship__pip';
    pips.append(pip);
  }

  return pips;
}
