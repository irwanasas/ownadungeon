// Static balance data for trap-type dungeon items.
export const TRAPS = {
  spike: {
    id: 'spike', name: 'Spike Trap', icon: '🗡', kind: 'trap',
    desc: 'Damage instan saat terinjak.',
    baseDamage: 14, dmgPerLevel: 5,
    cost: { gold: 0, souls: 0 }
  },
  poison: {
    id: 'poison', name: 'Poison Trap', icon: '☠', kind: 'trap',
    desc: 'Racun berjalan, damage tiap giliran combat berikutnya.',
    baseDamage: 6, dmgPerLevel: 3, dotRounds: 3,
    cost: { gold: 35, souls: 0 }
  },
  net: {
    id: 'net', name: 'Net Trap', icon: '🕸', kind: 'trap',
    desc: 'Hero terjerat, ATK menurun untuk sisa raid.',
    baseDamage: 5, dmgPerLevel: 2, atkReduction: 0.28,
    cost: { gold: 55, souls: 0 }
  }
};
