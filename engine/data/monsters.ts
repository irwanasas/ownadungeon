import type { MonsterDef } from '../types';

export const MONSTERS: MonsterDef[] = [
  {
    id: 'brute',
    name: 'Brute',
    role: 'brute',
    tag: 'physical',
    baseHp: 30,
    baseAtk: 9,
    baseDef: 2,
    hpPerLevel: 6,
    atkPerLevel: 1.2,
    hitsPerRound: 1,
    desc: 'One heavy hit a round. Dangerous to anyone who can\'t mitigate or dodge it.',
    goldCost: 16,
    goldValue: 14
  },
  {
    id: 'swarm',
    name: 'Swarm',
    role: 'swarm',
    tag: 'physical',
    baseHp: 20,
    baseAtk: 4,
    baseDef: 0,
    hpPerLevel: 4,
    atkPerLevel: 0.6,
    hitsPerRound: 3,
    desc: 'Three weak hits a round — rolls evasion three times. Deadly once evasion is chilled.',
    goldCost: 16,
    goldValue: 15
  },
  {
    id: 'shaman',
    name: 'Shaman',
    role: 'shaman',
    tag: 'arcane',
    baseHp: 22,
    baseAtk: 5,
    baseDef: 1,
    hpPerLevel: 5,
    atkPerLevel: 0.8,
    hitsPerRound: 1,
    appliesStatus: { kind: 'weaken', rooms: 2, atkMult: 0.7 },
    desc: 'Weakens the hero\'s attack for 2 rooms on a landed hit. Undercuts a ramping caster.',
    goldCost: 18,
    goldValue: 17
  }
];

export function monsterById(id: string): MonsterDef {
  const m = MONSTERS.find((x) => x.id === id);
  if (!m) throw new Error('unknown monster ' + id);
  return m;
}

export const KING_BASE = { hp: 50, atk: 10, def: 3, hpPerLevel: 16, atkPerLevel: 2, defPerLevel: 1 };
