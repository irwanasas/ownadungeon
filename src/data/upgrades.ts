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
  { id: 'poison', label: 'Buka: Poison Trap', cost: { gold: 32, souls: 0 } },
  { id: 'net', label: 'Buka: Net Trap', cost: { gold: 50, souls: 0 } },
  { id: 'fire', label: 'Buka: Fire Trap', cost: { gold: 58, souls: 2 } },
  { id: 'frost', label: 'Buka: Frost Trap', cost: { gold: 68, souls: 3 } },
  { id: 'goblin', label: 'Buka: Goblin Brute', cost: { gold: 38, souls: 0 } },
  { id: 'ogre', label: 'Buka: Bone Ogre', cost: { gold: 70, souls: 3 } },
  { id: 'slime', label: 'Buka: Acid Slime', cost: { gold: 52, souls: 2 } },
  { id: 'shade', label: 'Buka: Shadow Wraith', cost: { gold: 88, souls: 5 } },
  { id: 'slot4', label: 'Gali Ruang ke-4', cost: { gold: 90, souls: 5 } },
  { id: 'slot5', label: 'Gali Ruang ke-5', cost: { gold: 150, souls: 12 } }
];
