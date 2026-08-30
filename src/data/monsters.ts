import type { MonsterDef, TreasureDef } from '../types';

export const MONSTERS: MonsterDef[] = [
  {
    id: 'skeleton',
    kind: 'monster',
    name: 'Skeleton Archer',
    icon: '\uD83C\uDFF9',
    baseHp: 18,
    hpPerLevel: 4,
    baseAtk: 5,
    atkPerLevel: 1,
    baseDef: 0,
    desc: 'Steady ranged chip. Weak to gap-closers.',
    tags: ['ranged', 'undead']
  },
  {
    id: 'goblin',
    kind: 'monster',
    name: 'Goblin Brute',
    icon: '\uD83D\uDC79',
    baseHp: 22,
    hpPerLevel: 5,
    baseAtk: 8,
    atkPerLevel: 2,
    baseDef: 1,
    desc: 'High burst ATK, low HP.',
    tags: ['physical', 'brute']
  },
  {
    id: 'ogre',
    kind: 'monster',
    name: 'Bone Ogre',
    icon: '\uD83E\uDDCC',
    baseHp: 40,
    hpPerLevel: 8,
    baseAtk: 7,
    atkPerLevel: 1,
    baseDef: 4,
    desc: 'High HP and DEF. Drains stamina.',
    tags: ['physical', 'tank']
  },
  {
    id: 'slime',
    kind: 'monster',
    name: 'Acid Slime',
    icon: '\uD83D\uDC0A',
    baseHp: 28,
    hpPerLevel: 6,
    baseAtk: 4,
    atkPerLevel: 1,
    baseDef: 2,
    desc: 'Physical resist; weak to magic and fire.',
    tags: ['physical', 'resist']
  },
  {
    id: 'shade',
    kind: 'monster',
    name: 'Shadow Wraith',
    icon: '\uD83D\uDC7B',
    baseHp: 26,
    hpPerLevel: 5,
    baseAtk: 6,
    atkPerLevel: 2,
    baseDef: 1,
    fearAura: true,
    desc: 'Ethereal with fear aura. Weak to holy/magic.',
    tags: ['ethereal', 'fear']
  }
];

export const TREASURE: TreasureDef = {
  id: 'treasure',
  kind: 'treasure',
  name: 'Treasure Vault',
  icon: '\uD83D\uDCB0',
  desc: 'If the hero reaches this room alive, they steal some of your reward.'
};
