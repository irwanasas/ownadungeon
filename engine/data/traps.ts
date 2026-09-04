import type { TrapDef } from '../types';

export const TRAPS: TrapDef[] = [
  {
    id: 'spike',
    name: 'Spike Trap',
    tag: 'physical',
    baseDamage: 10,
    dmgPerLevel: 2.5,
    desc: 'Instant burst. Punishes low-HP heroes before their plan starts.',
    goldCost: 12
  },
  {
    id: 'poison',
    name: 'Poison Gas',
    tag: 'poison',
    baseDamage: 4,
    dmgPerLevel: 1,
    statusOnHit: { kind: 'poison', rooms: 3, dmgPerTick: 5 },
    desc: 'Ticks for 3 rooms. Bypasses flat mitigation — wears tanks down.',
    goldCost: 14
  },
  {
    id: 'frost',
    name: 'Frost Trap',
    tag: 'frost',
    baseDamage: 6,
    dmgPerLevel: 1.5,
    statusOnHit: { kind: 'chill', rooms: 2, evasionDelta: -0.25 },
    desc: 'Chills the hero: -25% evasion for 2 rooms. Sets up a Swarm room.',
    goldCost: 14
  }
];

export function trapById(id: string): TrapDef {
  const t = TRAPS.find((x) => x.id === id);
  if (!t) throw new Error('unknown trap ' + id);
  return t;
}
