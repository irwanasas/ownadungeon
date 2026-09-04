import type { HeroDef } from '../types';

// Vertical slice ships 3 of the eventual 6-hero roster (one per family), each
// with a mechanic no one else has, so matchups are decided by how the dungeon
// is built, not by a bigger number winning.
export const HEROES: HeroDef[] = [
  {
    id: 'paladin',
    name: 'Paladin',
    family: 'warrior',
    role: 'Tank',
    color: '#6fb0f5',
    baseHp: 68,
    baseAtk: 7,
    baseDef: 6,
    evasion: 0.05,
    damageReduction: 0.28,
    rampPerRound: 0,
    rampCap: 0,
    fearImmune: true,
    resist: [],
    strengths: 'Mitigates direct hits, shrugs off fear.',
    weaknesses: 'Poison/burn ticks bypass mitigation and wear him down.'
  },
  {
    id: 'trickster',
    name: 'Trickster',
    family: 'rogue',
    role: 'Evasion',
    color: '#8f6fc7',
    baseHp: 40,
    baseAtk: 9,
    baseDef: 2,
    evasion: 0.45,
    damageReduction: 0,
    rampPerRound: 0,
    rampCap: 0,
    fearImmune: false,
    resist: [],
    strengths: 'Dodges most single hits outright.',
    weaknesses: 'Chilled evasion or repeated swarm hits break through fast.'
  },
  {
    id: 'elementalist',
    name: 'Elementalist',
    family: 'mage',
    role: 'Ramp Caster',
    color: '#f0a34a',
    baseHp: 34,
    baseAtk: 8,
    baseDef: 0,
    evasion: 0.08,
    damageReduction: 0,
    rampPerRound: 0.16,
    rampCap: 0.6,
    fearImmune: false,
    resist: ['fire', 'frost'],
    strengths: 'Grows stronger every round; resists fire and frost traps.',
    weaknesses: 'Fragile opener — a fast burst or a weaken debuff denies the ramp.'
  }
];

export function heroById(id: string): HeroDef {
  const h = HEROES.find((x) => x.id === id);
  if (!h) throw new Error('unknown hero ' + id);
  return h;
}
