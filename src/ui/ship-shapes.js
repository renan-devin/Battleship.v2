/**
 * UI layer: original top-down ship silhouettes drawn as inline SVG.
 *
 * Every shape is built here from the ship length, so a hull always spans
 * exactly the cells it occupies and no external asset is needed. Shapes are
 * authored bow-to-the-right and rotated for vertical placements, which keeps
 * the aspect ratio intact in both orientations.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const UNIT = 24;
const MID = UNIT / 2;

/**
 * @param {string} shipId
 * @param {number} size - Ship length in cells.
 * @param {{ orientation?: string, className?: string }} [options]
 * @returns {SVGElement} A decorative silhouette, hidden from assistive tech.
 */
export function createShipSilhouette(shipId, size, options = {}) {
  const { orientation = 'horizontal', className = 'ship-shape' } = options;
  const length = size * UNIT;
  const vertical = orientation === 'vertical';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('viewBox', vertical ? `0 0 ${UNIT} ${length}` : `0 0 ${length} ${UNIT}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.setProperty('--ship-length', String(size));

  const group = element('g', vertical ? { transform: `translate(${UNIT} 0) rotate(90)` } : {});
  group.append(...(SHAPES[shipId] ?? SHAPES.destroyer)(length));
  svg.append(group);

  return svg;
}

const SHAPES = {
  carrier: buildCarrier,
  battleship: buildBattleship,
  cruiser: buildCruiser,
  submarine: buildSubmarine,
  destroyer: buildDestroyer,
};

/** Carrier: full-length flight deck with a discreet island to starboard. */
function buildCarrier(length) {
  return [
    path(
      'hull',
      `M 3 3.5 L ${length - 13} 3.5 L ${length - 2} ${MID} L ${length - 13} ${UNIT - 3.5} L 3 ${UNIT - 3.5} Q 1.5 ${MID} 3 3.5 Z`,
    ),
    path('line', `M 7 ${MID} H ${length - 15}`),
    rect('tower', length * 0.6, 2.5, length * 0.1, 4.5, 1.5),
    rect('detail', length * 0.2, 8.5, 4, 3, 1),
    rect('detail', length * 0.36, 13, 4, 3, 1),
    rect('detail', length * 0.72, 15, 4, 3, 1),
  ];
}

/** Battleship: heavy hull, three main turrets, bridge and funnel. */
function buildBattleship(length) {
  return [
    hull(length),
    path('line', `M 6 ${MID} H ${length - 8}`),
    turret(length * 0.2, 3.6),
    turret(length * 0.34, 3.6),
    turret(length * 0.78, 3.4),
    rect('tower', length * 0.44, 7, length * 0.12, 10, 2),
    rect('detail', length * 0.6, 8.5, length * 0.07, 7, 2),
  ];
}

/** Cruiser: leaner hull with two turrets and a slim superstructure. */
function buildCruiser(length) {
  return [
    hull(length),
    path('line', `M 6 ${MID} H ${length - 8}`),
    turret(length * 0.24, 3.2),
    turret(length * 0.76, 3),
    rect('tower', length * 0.42, 7.5, length * 0.16, 9, 2),
  ];
}

/** Submarine: narrow pressure hull, conning tower and stern planes. */
function buildSubmarine(length) {
  return [
    path(
      'hull',
      `M 4 ${MID} C 4 8 7 6.5 11 6.5 L ${length - 12} 6.5 C ${length - 6} 7.5 ${length - 2.5} 9.5 ${length - 2} ${MID} C ${length - 2.5} 14.5 ${length - 6} 16.5 ${length - 12} 17.5 L 11 17.5 C 7 17.5 4 16 4 ${MID} Z`,
    ),
    path('fin', `M 5 3 L 12 8 L 12 16 L 5 21 Z`),
    rect('tower', length * 0.4, 8, length * 0.14, 8, 2),
    path('line', `M ${length * 0.47} 2.5 V 8`),
  ];
}

/** Destroyer: compact agile hull with a single turret and small bridge. */
function buildDestroyer(length) {
  return [
    hull(length),
    path('line', `M 6 ${MID} H ${length - 8}`),
    turret(length * 0.28, 3),
    rect('tower', length * 0.48, 8, length * 0.2, 8, 2),
  ];
}

/** Shared surface hull: rounded stern, raked bow to the right. */
function hull(length) {
  return path(
    'hull',
    `M 3 ${MID} C 3 5.5 5.5 3.5 9 3.5 L ${length - 11} 3.5 C ${length - 6} 4.5 ${length - 3} 8 ${length - 2} ${MID} C ${length - 3} 16 ${length - 6} 19.5 ${length - 11} 20.5 L 9 20.5 C 5.5 20.5 3 18.5 3 ${MID} Z`,
  );
}

function turret(x, radius) {
  return element('circle', {
    class: 'ship-shape__turret',
    cx: String(x),
    cy: String(MID),
    r: String(radius),
  });
}

function rect(part, x, y, width, height, radius) {
  return element('rect', {
    class: `ship-shape__${part}`,
    x: String(x),
    y: String(y),
    width: String(width),
    height: String(height),
    rx: String(radius),
  });
}

function path(part, d) {
  return element('path', { class: `ship-shape__${part}`, d: d.replace(/\s+/g, ' ') });
}

function element(tag, attributes) {
  const node = document.createElementNS(SVG_NS, tag);

  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }

  return node;
}
