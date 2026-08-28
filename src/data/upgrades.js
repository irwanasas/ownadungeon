// Definitions for the "Peningkatan" (upgrades) panel: per-level upgrades
// for existing items, and one-time unlocks for new items/rooms.
export const UPGRADE_DEFS = [
  { id: 'spike', label: 'Spike Trap — Damage', type: 'trap', baseCost: 15 },
  { id: 'poison', label: 'Poison Trap — Damage', type: 'trap', baseCost: 22, requiresUnlock: 'poison' },
  { id: 'net', label: 'Net Trap — Damage', type: 'trap', baseCost: 28, requiresUnlock: 'net' },
  { id: 'skeleton', label: 'Skeleton Archer — Level', type: 'monster', baseCost: 18 },
  { id: 'goblin', label: 'Goblin Brute — Level', type: 'monster', baseCost: 26, requiresUnlock: 'goblin' },
  { id: 'ogre', label: 'Bone Ogre — Level', type: 'monster', baseCost: 36, requiresUnlock: 'ogre' }
];

export const UNLOCK_DEFS = [
  { id: 'poison', label: 'Buka: Poison Trap', cost: { gold: 35, souls: 0 } },
  { id: 'net', label: 'Buka: Net Trap', cost: { gold: 55, souls: 0 } },
  { id: 'goblin', label: 'Buka: Goblin Brute', cost: { gold: 40, souls: 0 } },
  { id: 'ogre', label: 'Buka: Bone Ogre', cost: { gold: 75, souls: 4 } },
  { id: 'slot4', label: 'Gali Ruang ke-4', cost: { gold: 95, souls: 6 } },
  { id: 'slot5', label: 'Gali Ruang ke-5', cost: { gold: 160, souls: 14 } }
];
