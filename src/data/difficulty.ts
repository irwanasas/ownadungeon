import type { StageDifficulty, ArcadeDifficulty } from '../types';
import { getStageDef } from './stages';

export const STAGE_MAX = 50;

export function getStageDiff(stage?: number): StageDifficulty {
  const s = Math.max(1, Math.min(STAGE_MAX, stage || 1));
  const band = s <= 5 ? 0 : s <= 20 ? 1 : s <= 35 ? 2 : 3;
  const t = (s - 1) / (STAGE_MAX - 1);
  const def = getStageDef(s);
  return {
    stage: s,
    band: band,
    trapMult: 1,
    monsterHpMult: 1,
    monsterAtkMult: 1,
    kingMult: 1,
    rewardMult: 1 + t * 0.4,
    heroLevelBonus: 0,
    firstClearBonusGold: 18 + s * 3,
    firstClearBonusSouls: s >= 10 ? 1 : 0,
    compositionHint: def.note
  };
}

export function getArcadeDiff(wave?: number): ArcadeDifficulty {
  var w = Math.max(1, wave || 1);
  var t = Math.min(1.4, (w - 1) * 0.04);
  return {
    wave: w,
    trapMult: 1 + t * 0.7,
    monsterHpMult: 1 + t * 0.8,
    monsterAtkMult: 1 + t * 0.65,
    kingMult: 1 + t * 0.75,
    rewardMult: 1 + t * 0.9,
    heroLevelBonus: Math.floor((w - 1) / 6)
  };
}
