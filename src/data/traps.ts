import type { TrapDef } from '../types';

export const TRAPS: Record<string, TrapDef> = {
  spike: {
    id: 'spike',
    name: 'Spike Trap',
    icon: 'spike',
    kind: 'trap',
    tags: ['physical', 'instant'],
    desc: 'Damage fisik instan. Lemah vs armor tebal.',
    baseDamage: 14,
    dmgPerLevel: 5,
    cost: { gold: 0, souls: 0 }
  },
  poison: {
    id: 'poison',
    name: 'Poison Trap',
    icon: 'poison',
    kind: 'trap',
    tags: ['dot', 'nature'],
    desc: 'DOT tiap giliran. Menyiksa high-HP.',
    baseDamage: 6,
    dmgPerLevel: 3,
    dotRounds: 3,
    cost: { gold: 32, souls: 0 }
  },
  net: {
    id: 'net',
    name: 'Net Trap',
    icon: 'net',
    kind: 'trap',
    tags: ['control'],
    desc: 'Turunkan ATK. Menjerat kelas evasive dan menunda RAGE Berserker.',
    baseDamage: 4,
    dmgPerLevel: 2,
    atkReduction: 0.28,
    cost: { gold: 48, souls: 0 }
  },
  fire: {
    id: 'fire',
    name: 'Fire Trap',
    icon: 'fire',
    kind: 'trap',
    tags: ['fire', 'dot'],
    desc: 'Burn instan + sisa panas. Kuat vs slime.',
    baseDamage: 11,
    dmgPerLevel: 4,
    burnRounds: 2,
    cost: { gold: 60, souls: 2 }
  },
  frost: {
    id: 'frost',
    name: 'Frost Trap',
    icon: 'frost',
    kind: 'trap',
    tags: ['control', 'cold'],
    desc: 'Kurangi DEF hero sementara. Soften tank.',
    baseDamage: 5,
    dmgPerLevel: 2,
    defReduction: 0.35,
    cost: { gold: 70, souls: 3 }
  }
};
