var STRONG = 1.25;
var WEAK = 0.8;

export const HERO_VS_MONSTER = {
  warrior: { skeleton: STRONG, goblin: 1.1, ogre: 1.15, slime: WEAK, shade: WEAK },
  rogue: { skeleton: STRONG, goblin: 0.95, ogre: WEAK, slime: 0.85, shade: 1.05 },
  berserker: { skeleton: 1.05, goblin: 1.1, ogre: STRONG, slime: 0.9, shade: 0.85 },
  mage: { skeleton: 1.1, goblin: WEAK, ogre: 1.05, slime: STRONG, shade: STRONG },
  paladin: { skeleton: STRONG, goblin: 0.95, ogre: 1.1, slime: 0.9, shade: STRONG }
};

export const HERO_VS_TRAP = {
  warrior: { spike: 0.72, poison: 1.28, net: 1.0, fire: 1.05, frost: 0.95 },
  rogue: { spike: 0.85, poison: 1.05, net: 1.22, fire: 1.0, frost: 1.05 },
  berserker: { spike: 1.08, poison: 1.2, net: 1.15, fire: 1.1, frost: 1.0 },
  mage: { spike: 1.3, poison: 1.0, net: 1.05, fire: 0.9, frost: 0.88 },
  paladin: { spike: 0.9, poison: 1.22, net: 0.95, fire: 1.0, frost: 0.92 }
};

export function heroMonsterMult(heroClassId, monsterId) {
  var row = HERO_VS_MONSTER[heroClassId];
  if (!row) return 1;
  var m = row[monsterId];
  return typeof m === 'number' ? m : 1;
}

export function heroTrapMult(heroClassId, trapId) {
  var row = HERO_VS_TRAP[heroClassId];
  if (!row) return 1;
  var m = row[trapId];
  return typeof m === 'number' ? m : 1;
}

export function matchupLabel(mult) {
  if (mult >= 1.2) return 'strong';
  if (mult <= 0.85) return 'weak';
  return 'neutral';
}

export function applySpecialOnTrap(hero, trapId, baseDmg) {
  var special = null;
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

export function applySpecialOnMonsterHit(hero, monster, heroDmg) {
  var dmg = heroDmg;
  var note = null;
  if (monster.physicalResist && !hero.magicAtk && !hero.holy) {
    dmg = Math.round(dmg * (1 - monster.physicalResist));
    note = 'physical_resist';
  }
  if (hero.magicAtk && (monster.id === 'slime' || monster.id === 'shade')) {
    dmg = Math.round(dmg * 1.08);
    note = 'magic_bonus';
  }
  if (hero.holy && (monster.id === 'skeleton' || monster.id === 'ogre' || monster.id === 'shade')) {
    dmg = Math.round(dmg * 1.12);
    note = 'holy_bonus';
  }
  if (hero.classId === 'rogue' && monster.id === 'skeleton' && !hero._firstStrikeUsed) {
    dmg = Math.round(dmg * 1.2);
    hero._firstStrikeUsed = true;
    note = 'first_strike';
  }
  return { dmg: dmg, note: note };
}
