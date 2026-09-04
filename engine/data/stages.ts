import type { StageDef } from '../types';

// Vertical-slice progression: 6 handcrafted stages that each introduce one new
// piece (a trap, a monster, a combo, the King) rather than just more HP.
export const STAGES: StageDef[] = [
  {
    id: 1,
    title: 'First Blood',
    heroPool: ['paladin'],
    unlockTrapIds: ['spike'],
    unlockMonsterIds: [],
    kingLevel: 1,
    note: 'One Spike Trap. Learn build -> raid -> watch.'
  },
  {
    id: 2,
    title: 'The Slow Burn',
    heroPool: ['paladin', 'trickster'],
    unlockTrapIds: ['poison'],
    unlockMonsterIds: [],
    kingLevel: 1,
    note: 'Poison ticks for 3 rooms and skips mitigation — dangerous to Paladin.'
  },
  {
    id: 3,
    title: 'Something Alive',
    heroPool: ['paladin', 'trickster'],
    unlockTrapIds: [],
    unlockMonsterIds: ['brute'],
    kingLevel: 2,
    note: 'A real fight: multiple rounds, the hero can attack back.'
  },
  {
    id: 4,
    title: 'Chilled to the Bone',
    heroPool: ['paladin', 'trickster', 'elementalist'],
    unlockTrapIds: ['frost'],
    unlockMonsterIds: ['swarm'],
    kingLevel: 2,
    note: 'Frost chills evasion, then Swarm rolls three hits into the gap.'
  },
  {
    id: 5,
    title: 'Word of Weakening',
    heroPool: ['paladin', 'trickster', 'elementalist'],
    unlockTrapIds: [],
    unlockMonsterIds: ['shaman'],
    kingLevel: 3,
    note: 'Shaman\'s weaken denies a ramping caster before it snowballs.'
  },
  {
    id: 6,
    title: 'The Throne',
    heroPool: ['paladin', 'trickster', 'elementalist'],
    unlockTrapIds: [],
    unlockMonsterIds: [],
    kingLevel: 4,
    note: 'Everything you\'ve learned, then the King himself.'
  }
];

export const STAGE_MAX = STAGES.length;

export function stageById(id: number): StageDef {
  const s = STAGES.find((x) => x.id === id);
  return s || STAGES[STAGES.length - 1];
}
