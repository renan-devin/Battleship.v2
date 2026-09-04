/**
 * State layer: pure logic, no DOM, no framework.
 *
 * Future home of the orchestration between engine, AI and UI: current turn,
 * selected difficulty and game phase. Kept side-effect free so state
 * transitions can be tested without a browser.
 */

export const INITIAL_STATE = Object.freeze({
  phase: 'idle',
  difficulty: 'easy',
});
