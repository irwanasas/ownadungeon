import type { Hero, MonsterDef } from '../types';

var STRONG = 1.12;
var WEAK = 0.9;

export type MatchupLabel = 'strong' | 'weak' | 'neutral';

export const HERO_VS_MONSTER: Record<string, Record<string, number>> = {
  paladin: { slime: 0.95, goblin_troop: 1.0, goblin_shaman: 1.05, goblin_elite: 1.05, orc: STRONG },
  berserker: { slime: 0.95, goblin_troop: 1.05, goblin_shaman: 1.0, goblin_elite: STRONG, orc: 1.0 },
  trickster: { slime: 0.9, goblin_troop: 0.95, goblin_shaman: STRONG, goblin_elite: WEAK, orc: 0.95 },
  assassin: { slime: 0.9, goblin_troop: STRONG, goblin_shaman: 1.05, goblin_elite: WEAK, orc: 0.95 },
  druid: { slime: 1.0, goblin_troop: 0.95, goblin_shaman: 1.0, goblin_elite: 0.95, orc: WEAK },
  elementalist: { slime: STRONG, goblin_troop: WEAK, goblin_shaman: 1.05, goblin_elite: 1.0, orc: 0.95 }
};

export const HERO_VS_TRAP: Record<string, Record<string, number>> = {
  paladin: { spike: 0.9, poison: 1.05, net: 1.0, fire: 1.0, frost: 0.95 },
  berserker: { spike: 1.05, poison: 1.1, net: 1.1, fire: 1.05, frost: 1.0 },
  trickster: { spike: 0.85, poison: 1.05, net: STRONG, fire: 0.95, frost: 0.95 },
  assassin: { spike: STRONG, poison: 1.05, net: 1.05, fire: 1.0, frost: 1.0 },
  druid: { spike: 1.0, poison: 0.85, net: 1.0, fire: 0.9, frost: 1.0 },
  elementalist: { spike: 1.05, poison: 0.9, net: STRONG, fire: 0.85, frost: 0.88 }
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
  if (mult >= 1.1) return 'strong';
  if (mult <= 0.9) return 'weak';
  return 'neutral';
}

export function applySpecialOnTrap(
  hero: Hero,
  trapId: string,
  trapTags: string[],
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
  if (hero.elementalAffinity && (trapTags.indexOf('fire') !== -1 || trapTags.indexOf('cold') !== -1 || trapTags.indexOf('nature') !== -1)) {
    dmg = Math.round(dmg * 0.75);
    special = 'elemental_affinity';
  }
  if (hero.natureResist && (trapTags.indexOf('nature') !== -1 || trapTags.indexOf('dot') !== -1)) {
    dmg = Math.round(dmg * 0.7);
    special = 'nature_resist';
  }
  if (hero.damageReduction) {
    dmg = Math.round(dmg * (1 - hero.damageReduction));
    special = special || 'damage_reduction';
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
  if (monster.physicalResist && !hero.magicAtk) {
    dmg = Math.round(dmg * (1 - monster.physicalResist));
    note = 'physical_resist';
  }

  if (hero.magicAtk && monster.type === 'resist') {
    dmg = Math.round(dmg * 1.08);
    note = 'magic_bonus';
  }
  return { dmg: dmg, note: note };
}
