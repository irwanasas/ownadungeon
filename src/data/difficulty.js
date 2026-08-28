// Pure difficulty-scaling formulas for Stage mode and Arcade mode.
// These take a stage/wave number and return multipliers — they do not
// read game state directly (see combat/difficultyResolver.js for the
// state-aware wrapper used during a raid).
export const STAGE_MAX = 10;

export function getStageDiff(stage) {
  stage = Math.min(STAGE_MAX, Math.max(1, Math.floor(stage || 1)));
  return {
    stage: stage,
    heroLevelBonus: stage - 1,
    trapMult: 1 + (stage - 1) * 0.12,
    monsterHpMult: 1 + (stage - 1) * 0.14,
    monsterAtkMult: 1 + (stage - 1) * 0.12,
    kingMult: 1 + (stage - 1) * 0.1,
    rewardMult: 1 + (stage - 1) * 0.12,
    firstClearBonusGold: 25 + stage * 12,
    firstClearBonusSouls: stage >= 4 ? 2 : 1
  };
}

export function getArcadeDiff(wave) {
  wave = Math.max(1, Math.floor(wave || 1));
  var t = wave - 1;
  return {
    wave: wave,
    heroLevelBonus: Math.floor(t * 0.75),
    trapMult: 1 + t * 0.08,
    monsterHpMult: 1 + t * 0.1,
    monsterAtkMult: 1 + t * 0.09,
    kingMult: 1 + t * 0.07,
    rewardMult: 1 + t * 0.1,
    firstClearBonusGold: 0,
    firstClearBonusSouls: 0
  };
}
