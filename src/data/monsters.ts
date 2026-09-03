import type { MonsterDef, TreasureDef } from '../types';

export const MONSTERS: Record<string, MonsterDef> = {
  slime: {
    id: 'slime',
    name: 'Slime',
    icon: 'slime',
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
    icon: 'goblin_troop',
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
    icon: 'goblin_shaman',
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
    icon: 'goblin_elite',
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
    icon: 'orc',
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
  icon: 'treasure',
  kind: 'treasure',
  desc: 'If the hero reaches this room alive, they steal some of your reward.'
};
