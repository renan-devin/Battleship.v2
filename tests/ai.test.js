import { describe, expect, it } from 'vitest';

import { DIFFICULTIES, chooseTarget, getAvailableTargets } from '../src/ai/index.js';
import { BOARD_SIZE } from '../src/engine/constants.js';
import { fireAt } from '../src/engine/combat.js';

describe('DIFFICULTIES', () => {
  it('lists the planned difficulties', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'hard']);
  });
});

describe('getAvailableTargets', () => {
  it('starts with the whole board', () => {
    expect(getAvailableTargets([])).toHaveLength(BOARD_SIZE * BOARD_SIZE);
  });

  it('drops cells already fired at', () => {
    const shots = fireAt([], [], { row: 4, column: 7 }).shots;
    const targets = getAvailableTargets(shots);

    expect(targets).toHaveLength(BOARD_SIZE * BOARD_SIZE - 1);
    expect(targets).not.toContainEqual({ row: 4, column: 7 });
  });
});

describe('chooseTarget', () => {
  it('picks a cell from the untouched ones', () => {
    expect(chooseTarget([], () => 0)).toEqual({ row: 0, column: 0 });
    expect(chooseTarget([], () => 0.999)).toEqual({ row: 9, column: 9 });
  });

  it('never repeats a shot until the board is exhausted', () => {
    let shots = [];

    for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index += 1) {
      const target = chooseTarget(shots);

      expect(target).not.toBeNull();
      shots = fireAt([], shots, target).shots;
      expect(shots).toHaveLength(index + 1);
    }

    expect(chooseTarget(shots)).toBeNull();
  });
});
