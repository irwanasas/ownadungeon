// Static balance data for monster-type dungeon items and the treasure room.
export const MONSTERS = {
  skeleton: {
    id: 'skeleton', name: 'Skeleton Archer', icon: '🏹', kind: 'monster',
    desc: 'Ranged, ATK rendah tapi konsisten.',
    baseHp: 32, baseAtk: 8, baseDef: 1,
    hpPerLevel: 9, atkPerLevel: 2,
    cost: { gold: 0, souls: 0 }
  },
  goblin: {
    id: 'goblin', name: 'Goblin Brute', icon: '👹', kind: 'monster',
    desc: 'HP rendah, ATK tinggi. Cepat mati, cepat membunuh.',
    baseHp: 24, baseAtk: 12, baseDef: 0,
    hpPerLevel: 7, atkPerLevel: 3,
    cost: { gold: 45, souls: 0 }
  },
  ogre: {
    id: 'ogre', name: 'Bone Ogre', icon: '🦴', kind: 'monster',
    desc: 'HP tinggi, tahan lama. Baik untuk menguras hero.',
    baseHp: 60, baseAtk: 7, baseDef: 3,
    hpPerLevel: 13, atkPerLevel: 2,
    cost: { gold: 80, souls: 4 }
  }
};

export const TREASURE = {
  id: 'treasure',
  name: 'Treasure Vault',
  icon: '💰',
  kind: 'treasure',
  desc: 'Jika hero mencapai ruang ini hidup-hidup, ia mencuri sebagian rewardmu.'
};
