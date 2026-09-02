import type { Hero, RaidDifficulty } from '../types';
import { state } from '../state/gameState';
import { STAGE_MAX } from '../data/difficulty';

export interface RaidOutcome {
  dungeonWin: boolean;
  heroEscape: boolean;
  heroVictory: boolean;
}

export function applyRaidOutcome(
  hero: Hero,
  outcome: RaidOutcome,
  goldReward: number,
  soulsReward: number,
  stageDiff: RaidDifficulty
): void {
  var heroVictory = outcome.heroVictory;
  if (hero.hp > 0 && !outcome.heroEscape && !heroVictory) {
    heroVictory = true;
  }

  if (outcome.dungeonWin) {
    goldReward += 32 + state.slotCount * 10;
    soulsReward += 1;
    state.stats.dungeonWins++;

    if (state.mode === 'stage') {
      var firstClear = state.stage > state.maxStageCleared;
      if (firstClear) {
        state.maxStageCleared = state.stage;
        goldReward += stageDiff.firstClearBonusGold || 0;
        soulsReward += stageDiff.firstClearBonusSouls || 0;
      }
      if (state.stage < STAGE_MAX) {
        state.stage += 1;
      }
    } else if (state.mode === 'arcade') {
      var wave = state.arcadeWave || 1;
      if (wave > (state.arcadeBest || 0)) {
        state.arcadeBest = wave;
      }
      state.arcadeWave = wave + 1;
    }
  } else if (outcome.heroEscape) {
    state.stats.heroEscapes++;
    goldReward = Math.round(goldReward * 0.35);
  } else if (heroVictory) {
    state.stats.heroVictories++;
    goldReward = Math.round(goldReward * 0.45);
  }

  if (stageDiff.rewardMult && stageDiff.rewardMult !== 1) {
    goldReward = Math.round(goldReward * stageDiff.rewardMult);
    if (soulsReward > 0) {
      soulsReward = Math.max(1, Math.round(soulsReward * Math.min(2.5, 1 + (stageDiff.rewardMult - 1) * 0.5)));
    }
  }

  state.gold += goldReward;
  state.souls += soulsReward;
  state.stats.raidsTotal++;
}
