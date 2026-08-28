// Bridges the pure difficulty formulas (data/difficulty.js) with the
// player's current mode/progress in game state, so combat code can ask
// "what's today's difficulty?" without caring whether we're in Stage or
// Arcade mode.
import { state } from '../state/gameState.js';
import { getStageDiff, getArcadeDiff } from '../data/difficulty.js';

export function getRaidDiff() {
  if (state.mode === 'arcade') {
    return getArcadeDiff(state.arcadeWave || 1);
  }
  return getStageDiff(state.stage);
}
