import type { StageDifficulty, ArcadeDifficulty } from '../types';

export const STAGE_MAX = 50;

export function getStageDiff(stage?: number): StageDifficulty {
  var s = Math.max(1, Math.min(STAGE_MAX, stage || 1));
  var band = s <= 5 ? 0 : s <= 15 ? 1 : s <= 30 ? 2 : 3;
  var t = (s - 1) / (STAGE_MAX - 1);
  return {
    stage: s,
    band: band,
    trapMult: 1 + t * 0.55,
    monsterHpMult: 1 + t * 0.65,
    monsterAtkMult: 1 + t * 0.5,
    kingMult: 1 + t * 0.7,
    rewardMult: 1 + t * 0.85,
    heroLevelBonus: Math.floor((s - 1) / 8),
    firstClearBonusGold: 18 + s * 3,
    firstClearBonusSouls: s >= 10 ? 1 : 0,
    compositionHint:
      band === 0
        ? 'Belajar matchup dasar'
        : band === 1
          ? 'Kombinasi 2 ancaman'
          : band === 2
            ? 'Multi-tag rooms'
            : 'Persiapan wajib'
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
