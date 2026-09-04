import { describe, expect, it } from 'vitest';

import { BOARD_SIZE } from '../src/engine/index.js';
import { DIFFICULTIES } from '../src/ai/index.js';
import { INITIAL_STATE } from '../src/state/index.js';

describe('project smoke test', () => {
  it('exposes a 10x10 board size', () => {
    expect(BOARD_SIZE).toBe(10);
  });

  it('exposes the planned difficulties', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'hard']);
  });

  it('starts idle on easy', () => {
    expect(INITIAL_STATE).toEqual({ phase: 'idle', difficulty: 'easy' });
  });
});
