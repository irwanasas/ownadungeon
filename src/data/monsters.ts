import type { MonsterDef, TreasureDef } from '../types';

export const MONSTERS: Record<string, MonsterDef> = {
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton Archer',
    icon: '\uD83C\uDFF9',
    kind: 'monster',
    type: 'ranged',
    tags: ['undead', 'ranged'],
    desc: 'Steady ranged chip. Weak to gap-closers.',
    baseHp: 30,
    baseAtk: 9,
    baseDef: 1,
    hpPerLevel: 8,
    atkPerLevel: 2,
    cost: { gold: 0, souls: 0 }
  },
  goblin: {
    id: 'goblin',
    name: 'Goblin Brute',
    icon: '\uD83D\uDC79',
    kind: 'monster',
    type: 'brute',
    tags: ['physical', 'burst'],
    desc: 'High burst ATK, low HP.',
    baseHp: 26,
    baseAtk: 13,
    baseDef: 0,
    hpPerLevel: 7,
    atkPerLevel: 3,
    cost: { gold: 40, souls: 0 }
  },
  ogre: {
    id: 'ogre',
    name: 'Bone Ogre',
    icon: '\uD83E\uDDB4',
    kind: 'monster',
    type: 'tank',
    tags: ['undead', 'tank', 'physical'],
    desc: 'High HP and DEF. Drains stamina.',
    baseHp: 58,
    baseAtk: 7,
    baseDef: 4,
    hpPerLevel: 12,
    atkPerLevel: 2,
    cost: { gold: 75, souls: 3 }
  },
  slime: {
    id: 'slime',
    name: 'Acid Slime',
    icon: '\uD83D\uDFE2',
    kind: 'monster',
    type: 'resist',
    tags: ['acid', 'resist'],
    desc: 'Physical resist; weak to magic and fire.',
    baseHp: 40,
    baseAtk: 7,
    baseDef: 5,
    hpPerLevel: 10,
    atkPerLevel: 2,
    physicalResist: 0.3,
    cost: { gold: 55, souls: 2 }
  },
  shade: {
    id: 'shade',
    name: 'Shadow Wraith',
    icon: '\uD83D\uDC7B',
    kind: 'monster',
    type: 'ethereal',
    tags: ['ethereal', 'fear'],
    desc: 'Ethereal with fear aura. Weak to holy/magic.',
    baseHp: 34,
    baseAtk: 10,
    baseDef: 2,
    hpPerLevel: 9,
    atkPerLevel: 2,
    fearAura: 1,
    cost: { gold: 90, souls: 5 }
  }
};

export const TREASURE: TreasureDef = {
  id: 'treasure',
  name: 'Treasure Vault',
  icon: '\uD83D\uDCB0',
  kind: 'treasure',
  desc: 'If the hero reaches this room alive, they steal some of your reward.'
};
