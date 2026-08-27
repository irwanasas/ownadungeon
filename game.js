const TRAPS = {
  spike: {
    id: 'spike', name: 'Spike Trap', icon: '🗡', kind: 'trap',
    desc: 'Damage instan saat terinjak.',
    baseDamage: 12, dmgPerLevel: 6,
    cost: { gold: 0, souls: 0 }
  },
  poison: {
    id: 'poison', name: 'Poison Trap', icon: '☠', kind: 'trap',
    desc: 'Racun berjalan, damage tiap giliran combat berikutnya.',
    baseDamage: 5, dmgPerLevel: 2, dotRounds: 3,
    cost: { gold: 40, souls: 0 }
  },
  net: {
    id: 'net', name: 'Net Trap', icon: '🕸', kind: 'trap',
    desc: 'Hero terjerat, ATK menurun untuk sisa raid.',
    baseDamage: 4, dmgPerLevel: 1, atkReduction: 0.25,
    cost: { gold: 70, souls: 0 }
  }
};

// TEMP: full file too large for single tool call — will complete next
console.error('game.js incomplete - waiting for full push');
