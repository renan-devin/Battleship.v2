/**
 * UI layer: ship silhouettes drawn as inline SVG.
 *
 * The shapes are built here from the ship length, so the roster shows a hull
 * whose proportions match the ship it represents without any external asset.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const CELL = 10;
const HEIGHT = 12;

/**
 * @param {number} size - Ship length in cells.
 * @returns {SVGElement} A decorative silhouette, hidden from assistive tech.
 */
export function createShipIcon(size) {
  const width = size * CELL;
  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.setAttribute('class', 'ship__icon');
  svg.setAttribute('viewBox', `0 0 ${width} ${HEIGHT}`);
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.setProperty('--ship-length', String(size));

  svg.append(createHull(width), createDeck(width), ...createTowers(size));

  return svg;
}

/** Hull: flat stern, raked bow, waterline along the bottom. */
function createHull(width) {
  const hull = document.createElementNS(SVG_NS, 'path');

  hull.setAttribute('class', 'ship__icon-hull');
  hull.setAttribute(
    'd',
    `M1 3 H${width - 6} L${width - 1} 6 L${width - 6} 9 H1 Q0 6 1 3 Z`.replace(/\s+/g, ' '),
  );

  return hull;
}

/** A single deck line keeps the small silhouettes readable. */
function createDeck(width) {
  const deck = document.createElementNS(SVG_NS, 'path');

  deck.setAttribute('class', 'ship__icon-deck');
  deck.setAttribute('d', `M3 6 H${width - 6}`);

  return deck;
}

/** One superstructure block per cell after the bow. */
function createTowers(size) {
  return Array.from({ length: size - 1 }, (_, index) => {
    const tower = document.createElementNS(SVG_NS, 'rect');

    tower.setAttribute('class', 'ship__icon-tower');
    tower.setAttribute('x', String(3 + index * CELL));
    tower.setAttribute('y', '1');
    tower.setAttribute('width', '4');
    tower.setAttribute('height', '2.5');
    tower.setAttribute('rx', '1');

    return tower;
  });
}
