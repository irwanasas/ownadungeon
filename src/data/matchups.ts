import type { Hero, MonsterDef } from '../types';

var STRONG = 1.25;
var WEAK = 0.8;

export type MatchupLabel = 'strong' | 'weak' | 'neutral';

export const HERO_VS_MONSTER: Record<string, Record<string, number>> = {
  warrior: { slime: WEAK, goblin_troop: 1.1, goblin_shaman: 1.05, goblin_elite: 1.15, orc: 0.95 },
  rogue: { slime: 0.85, goblin_troop: 0.95, goblin_shaman: STRONG, goblin_elite: WEAK, orc: 0.9 },
  berserker: { slime: 0.9, goblin_troop: 1.1, goblin_shaman: 1.05, goblin_elite: STRONG, orc: 1.0 },
  mage: { slime: STRONG, goblin_troop: WEAK, goblin_shaman: 1.1, goblin_elite: 1.05, orc: WEAK },
  paladin: { slime: 0.9, goblin_troop: 0.95, goblin_shaman: 1.1, goblin_elite: 1.1, orc: STRONG }
};

export const HERO_VS_TRAP: Record<string, Record<string, number>> = {
  warrior: { spike: 0.72, poison: 1.28, net: 1.0, fire: 1.05, frost: 0.95 },
  rogue: { spike: 0.85, poison: 1.05, net: 1.22, fire: 1.0, frost: 1.05 },
  berserker: { spike: 1.08, poison: 1.2, net: 1.15, fire: 1.1, frost: 1.0 },
  mage: { spike: 1.3, poison: 1.0, net: 1.05, fire: 0.9, frost: 0.88 },
  paladin: { spike: 0.9, poison: 1.22, net: 0.95, fire: 1.0, frost: 0.92 }
};

export function heroMonsterMult(heroClassId: string, monsterId: string): number {
  var row = HERO_VS_MONSTER[heroClassId];
  if (!row) return 1;
  var m = row[monsterId];
  return typeof m === 'number' ? m : 1;
}

export function heroTrapMult(heroClassId: string, trapId: string): number {
  var row = HERO_VS_TRAP[heroClassId];
  if (!row) return 1;
  var m = row[trapId];
  return typeof m === 'number' ? m : 1;
}

export function matchupLabel(mult: number): MatchupLabel {
  if (mult >= 1.2) return 'strong';
  if (mult <= 0.85) return 'weak';
  return 'neutral';
}

export function applySpecialOnTrap(
  hero: Hero,
  trapId: string,
  baseDmg: number
): { dmg: number; special: string | null } {
  var special: string | null = null;
  var dmg = baseDmg;
  if (trapId === 'net' && hero.classId === 'berserker') {
    hero.netBlocksRage = true;
    special = 'net_blocks_rage';
  }
  if (trapId === 'frost') {
    hero.def = Math.max(0, Math.round(hero.def * (1 - 0.35)));
    special = 'frost_def';
  }
  if (trapId === 'fire' && hero.classId === 'mage') {
    dmg = Math.round(dmg * 0.85);
    special = 'mage_fire_resist';
  }
  return { dmg: dmg, special: special };
}

export function applySpecialOnMonsterHit(
  hero: Hero,
  monster: MonsterDef,
  heroDmg: number
): { dmg: number; note: string | null } {
  var dmg = heroDmg;
  var note: string | null = null;
  if (monster.physicalResist && !hero.magicAtk && !hero.holy) {
    dmg = Math.round(dmg * (1 - monster.physicalResist));
    note = 'physical_resist';
  }

  if (hero.magicAtk && monster.type === 'resist') {
    dmg = Math.round(dmg * 1.08);
    note = 'magic_bonus';
  }

  if (hero.holy && monster.tags.indexOf('undead') !== -1) {
    dmg = Math.round(dmg * 1.12);
    note = 'holy_bonus';
  }
  if (hero.classId === 'rogue' && monster.type === 'ranged' && !hero._firstStrikeUsed) {
    dmg = Math.round(dmg * 1.2);
    hero._firstStrikeUsed = true;
    note = 'first_strike';
  }
  return { dmg: dmg, note: note };
}
