import { state } from '../state/gameState';
import { getStageDiff, getArcadeDiff } from '../data/difficulty';
import type { RaidDifficulty } from '../types';

export function getRaidDiff(): RaidDifficulty {
  if (state.mode === 'arcade') {
    return getArcadeDiff(state.arcadeWave || 1);
  }
  return getStageDiff(state.stage);
}
