import type { UpgradeDef, UnlockDef } from '../types';

export const UPGRADE_DEFS: UpgradeDef[] = [
  { id: 'spike', label: 'Spike Trap', type: 'trap', baseCost: 14 },
  { id: 'poison', label: 'Poison Trap', type: 'trap', baseCost: 20, requiresUnlock: 'poison' },
  { id: 'net', label: 'Net Trap', type: 'trap', baseCost: 26, requiresUnlock: 'net' },
  { id: 'fire', label: 'Fire Trap', type: 'trap', baseCost: 30, requiresUnlock: 'fire' },
  { id: 'frost', label: 'Frost Trap', type: 'trap', baseCost: 34, requiresUnlock: 'frost' },
  { id: 'skeleton', label: 'Skeleton Archer', type: 'monster', baseCost: 16 },
  { id: 'goblin', label: 'Goblin Brute', type: 'monster', baseCost: 24, requiresUnlock: 'goblin' },
  { id: 'ogre', label: 'Bone Ogre', type: 'monster', baseCost: 34, requiresUnlock: 'ogre' },
  { id: 'slime', label: 'Acid Slime', type: 'monster', baseCost: 28, requiresUnlock: 'slime' },
  { id: 'shade', label: 'Shadow Wraith', type: 'monster', baseCost: 40, requiresUnlock: 'shade' }
];

export const UNLOCK_DEFS: UnlockDef[] = [
  { id: 'poison', label: 'Unlock: Poison Trap', cost: { gold: 32, souls: 0 }, unlockAtStage: 3 },
  { id: 'goblin', label: 'Unlock: Goblin Brute', cost: { gold: 38, souls: 0 }, unlockAtStage: 3 },
  { id: 'slot4', label: 'Dig Room 4', cost: { gold: 90, souls: 5 }, unlockAtStage: 5 },
  { id: 'net', label: 'Unlock: Net Trap', cost: { gold: 50, souls: 0 }, unlockAtStage: 8 },
  { id: 'fire', label: 'Unlock: Fire Trap', cost: { gold: 58, souls: 2 }, unlockAtStage: 12 },
  { id: 'slime', label: 'Unlock: Acid Slime', cost: { gold: 52, souls: 2 }, unlockAtStage: 14 },
  { id: 'frost', label: 'Unlock: Frost Trap', cost: { gold: 68, souls: 3 }, unlockAtStage: 17 },
  { id: 'ogre', label: 'Unlock: Bone Ogre', cost: { gold: 70, souls: 3 }, unlockAtStage: 21 },
  { id: 'shade', label: 'Unlock: Shadow Wraith', cost: { gold: 88, souls: 5 }, unlockAtStage: 26 },
  { id: 'slot5', label: 'Dig Room 5', cost: { gold: 150, souls: 12 }, unlockAtStage: 32 }
];
