import type { KingBase, KingStats, KingUpgradeDef, Cost } from '../types';

export const KING_BASE: KingBase = {
  maxHp: 48,
  atk: 9,
  def: 2,
  hpPerLevel: 14,
  atkPerLevel: 2,
  defPerLevel: 1
};

export function getKingStats(level?: number): KingStats {
  level = Math.max(1, Math.floor(level || 1));
  return {
    level: level,
    maxHp: KING_BASE.maxHp + (level - 1) * KING_BASE.hpPerLevel,
    atk: KING_BASE.atk + (level - 1) * KING_BASE.atkPerLevel,
    def: KING_BASE.def + (level - 1) * KING_BASE.defPerLevel
  };
}

export const KING_UPGRADE: KingUpgradeDef = {
  baseGold: 35,
  goldGrowth: 1.48,
  soulsEvery: 3,
  soulsBase: 1
};

export function kingUpgradeCost(level?: number): Cost {
  level = Math.max(1, Math.floor(level || 1));
  var gold = Math.round(KING_UPGRADE.baseGold * Math.pow(KING_UPGRADE.goldGrowth, level - 1));
  var souls = 0;
  if (level >= 2) {
    souls = Math.floor(level / KING_UPGRADE.soulsEvery) * KING_UPGRADE.soulsBase;
  }
  return { gold: gold, souls: souls };
}
