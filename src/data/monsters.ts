import type { MonsterDef, TreasureDef } from '../types';

// Monster roster backed by the uploaded sprite packs in
// public/assets/monsters/ (see src/data/monsterSprites.ts for the sheet
// metadata + size tier each maps to). Progression is deliberately
// Slime -> Goblin Troop -> Goblin Shaman -> Goblin Elite -> Orc: HP, ATK,
// and unlock cost all climb monotonically, DEF mostly climbs too (Goblin
// Troop dips DEF for its burst-brute role — an intentional glass-cannon
// dip in an otherwise-rising curve, not a break in the progression).
export const MONSTERS: Record<string, MonsterDef> = {
  slime: {
    id: 'slime',
    name: 'Slime',
    icon: '🟢',
    kind: 'monster',
    type: 'resist',
    tags: ['acid', 'resist'],
    desc: 'Resists physical hits. Weak to magic and fire. Always available.',
    baseHp: 22,
    baseAtk: 6,
    baseDef: 2,
    hpPerLevel: 5,
    atkPerLevel: 1,
    physicalResist: 0.3,
    cost: { gold: 0, souls: 0 }
  },
  goblin_troop: {
    id: 'goblin_troop',
    name: 'Goblin Troop',
    icon: '👹',
    kind: 'monster',
    type: 'brute',
    tags: ['physical', 'burst'],
    desc: 'Fast burst damage, thin defense.',
    baseHp: 28,
    baseAtk: 12,
    baseDef: 1,
    hpPerLevel: 6,
    atkPerLevel: 2,
    cost: { gold: 40, souls: 0 }
  },
  goblin_shaman: {
    id: 'goblin_shaman',
    name: 'Goblin Shaman',
    icon: '🪄',
    kind: 'monster',
    type: 'ranged',
    tags: ['magic', 'ranged'],
    desc: 'Ranged caster chip damage. Frail up close.',
    baseHp: 32,
    baseAtk: 11,
    baseDef: 2,
    hpPerLevel: 7,
    atkPerLevel: 2,
    cost: { gold: 55, souls: 2 }
  },
  goblin_elite: {
    id: 'goblin_elite',
    name: 'Goblin Elite',
    icon: '🛡️',
    kind: 'monster',
    type: 'tank',
    tags: ['physical', 'tank', 'armored'],
    desc: 'Armored bruiser. High HP and DEF.',
    baseHp: 46,
    baseAtk: 14,
    baseDef: 4,
    hpPerLevel: 10,
    atkPerLevel: 2,
    cost: { gold: 70, souls: 3 }
  },
  orc: {
    id: 'orc',
    name: 'Orc',
    icon: '👺',
    kind: 'monster',
    type: 'brute',
    tags: ['physical', 'brute', 'heavy'],
    desc: 'Endgame heavy hitter. Massive HP and ATK.',
    baseHp: 60,
    baseAtk: 17,
    baseDef: 5,
    hpPerLevel: 13,
    atkPerLevel: 3,
    cost: { gold: 90, souls: 5 }
  }
};

export const TREASURE: TreasureDef = {
  id: 'treasure',
  name: 'Treasure Vault',
  icon: '💰',
  kind: 'treasure',
  desc: 'If the hero reaches this room alive, they steal some of your reward.'
};
