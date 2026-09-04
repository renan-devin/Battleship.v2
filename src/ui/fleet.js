/**
 * UI layer: fleet roster rendering.
 *
 * Lists the fleet so a ship can be selected before placing it, and shows which
 * ships are already on the board.
 */

import { FLEET } from '../engine/index.js';

/**
 * Creates one button per ship in the fleet.
 *
 * @param {HTMLElement} container
 * @returns {HTMLButtonElement[]} The created buttons, in fleet order.
 */
export function renderFleetRoster(container) {
  container.replaceChildren();

  return FLEET.map((ship) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ship';
    button.dataset.shipId = ship.id;
    button.append(
      createSpan('ship__name', ship.name),
      createShipPips(ship.size),
      createSpan('ship__status', ''),
    );
    container.append(button);
    return button;
  });
}

/**
 * Reflects selection and placement status on the roster buttons.
 *
 * @param {HTMLButtonElement[]} buttons
 * @param {object} state
 */
export function paintFleetRoster(buttons, state) {
  const placedIds = new Set(state.placements.map((placement) => placement.shipId));

  for (const button of buttons) {
    const shipId = button.dataset.shipId;
    const placed = placedIds.has(shipId);
    const selected = state.selectedShipId === shipId;

    button.classList.toggle('ship--placed', placed);
    button.classList.toggle('ship--selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.querySelector('.ship__status').textContent = placed ? 'Placed' : 'Pending';
  }
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
