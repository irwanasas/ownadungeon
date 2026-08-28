const TRAPS = {
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

const MONSTERS = {
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

const TREASURE = {
  id: 'treasure',
  name: 'Treasure Vault',
  icon: '💰',
  kind: 'treasure',
  desc: 'Jika hero mencapai ruang ini hidup-hidup, ia mencuri sebagian rewardmu.'
};

const HERO_ARCHETYPES = [
  {
    id: 'warrior',
    name: 'Warrior',
    className: 'Warrior',
    icon: '⚔',
    color: 'var(--bone)',
    baseHp: 60,
    baseAtk: 9,
    baseDef: 3,
    fleeThreshold: 3,
    fearImmune: false,
    canRage: false
  },
  {
    id: 'rogue',
    name: 'Rogue',
    className: 'Rogue',
    icon: '🗡',
    color: 'var(--soul)',
    baseHp: 42,
    baseAtk: 11,
    baseDef: 1,
    fleeThreshold: 2,
    trapEvasion: 0.4,
    fearImmune: false,
    canRage: false
  },
  {
    id: 'berserker',
    name: 'Berserker',
    className: 'Berserker',
    icon: '🪓',
    color: 'var(--ember-bright)',
    baseHp: 65,
    baseAtk: 10,
    baseDef: 1,
    fleeThreshold: 999,
    fearImmune: true,
    canRage: true,
    rageHpThreshold: 0.3,
    rageAtkMultiplier: 1.5,
    rageHealFraction: 0.15
  }
];

const NAME_POOL = [
  'Sir William',
  'Dame Ottavia',
  'Korrin the Bold',
  'Fenwick Ash',
  'Brannigan',
  'Ysolde Thorn',
  'Garrick Vane',
  'Marrow the Grim',
  'Petra Loam',
  'Osric Hale'
];

const KING_BASE = {
  maxHp: 48,
  atk: 9,
  def: 2,
  hpPerLevel: 14,
  atkPerLevel: 2,
  defPerLevel: 1
};

function getKingStats(level) {
  level = Math.max(1, Math.floor(level || 1));
  return {
    level: level,
    maxHp: KING_BASE.maxHp + (level - 1) * KING_BASE.hpPerLevel,
    atk: KING_BASE.atk + (level - 1) * KING_BASE.atkPerLevel,
    def: KING_BASE.def + (level - 1) * KING_BASE.defPerLevel
  };
}

const STAGE_MAX = 10;

function getStageDiff(stage) {
  stage = Math.min(STAGE_MAX, Math.max(1, Math.floor(stage || 1)));
  return {
    stage: stage,
    heroLevelBonus: stage - 1,
    trapMult: 1 + (stage - 1) * 0.12,
    monsterHpMult: 1 + (stage - 1) * 0.14,
    monsterAtkMult: 1 + (stage - 1) * 0.12,
    kingMult: 1 + (stage - 1) * 0.1,
    rewardMult: 1 + (stage - 1) * 0.12,
    firstClearBonusGold: 25 + stage * 12,
    firstClearBonusSouls: stage >= 4 ? 2 : 1
  };
}

function getArcadeDiff(wave) {
  wave = Math.max(1, Math.floor(wave || 1));
  var t = wave - 1;
  return {
    wave: wave,
    heroLevelBonus: Math.floor(t * 0.75),
    trapMult: 1 + t * 0.08,
    monsterHpMult: 1 + t * 0.1,
    monsterAtkMult: 1 + t * 0.09,
    kingMult: 1 + t * 0.07,
    rewardMult: 1 + t * 0.1,
    firstClearBonusGold: 0,
    firstClearBonusSouls: 0
  };
}

function getRaidDiff() {
  if (typeof state !== 'undefined' && state.mode === 'arcade') {
    return getArcadeDiff(state.arcadeWave || 1);
  }
  return getStageDiff(typeof state !== 'undefined' ? state.stage : 1);
}

const DEFAULT_STATE = {
  gold: 45,
  souls: 0,
  slotCount: 3,
  maxSlotCount: 5,
  dungeon: [null, null, null],
  levels: {
    spike: 1,
    poison: 1,
    net: 1,
    skeleton: 1,
    goblin: 1,
    ogre: 1
  },
  unlocked: {
    spike: true,
    poison: false,
    net: false,
    skeleton: true,
    goblin: false,
    ogre: false,
    slot4: false,
    slot5: false
  },
  stats: {
    raidsTotal: 0,
    dungeonWins: 0,
    heroEscapes: 0,
    heroVictories: 0
  },
  king: {
    level: 1
  },
  mode: 'stage',
  stage: 1,
  maxStageCleared: 0,
  arcadeWave: 1,
  arcadeBest: 0,
  lastActive: Date.now()
};

const KING_UPGRADE = {
  baseGold: 35,
  goldGrowth: 1.48,
  soulsEvery: 3,
  soulsBase: 1
};

function kingUpgradeCost(level) {
  level = Math.max(1, Math.floor(level || 1));
  var gold = Math.round(KING_UPGRADE.baseGold * Math.pow(KING_UPGRADE.goldGrowth, level - 1));
  var souls = 0;
  if (level >= 2) {
    souls = Math.floor(level / KING_UPGRADE.soulsEvery) * KING_UPGRADE.soulsBase;
  }
  return { gold: gold, souls: souls };
}

const UPGRADE_DEFS = [
  { id: 'spike', label: 'Spike Trap — Damage', type: 'trap', baseCost: 15 },
  { id: 'poison', label: 'Poison Trap — Damage', type: 'trap', baseCost: 22, requiresUnlock: 'poison' },
  { id: 'net', label: 'Net Trap — Damage', type: 'trap', baseCost: 28, requiresUnlock: 'net' },
  { id: 'skeleton', label: 'Skeleton Archer — Level', type: 'monster', baseCost: 18 },
  { id: 'goblin', label: 'Goblin Brute — Level', type: 'monster', baseCost: 26, requiresUnlock: 'goblin' },
  { id: 'ogre', label: 'Bone Ogre — Level', type: 'monster', baseCost: 36, requiresUnlock: 'ogre' }
];

const UNLOCK_DEFS = [
  { id: 'poison', label: 'Buka: Poison Trap', cost: { gold: 35, souls: 0 } },
  { id: 'net', label: 'Buka: Net Trap', cost: { gold: 55, souls: 0 } },
  { id: 'goblin', label: 'Buka: Goblin Brute', cost: { gold: 40, souls: 0 } },
  { id: 'ogre', label: 'Buka: Bone Ogre', cost: { gold: 75, souls: 4 } },
  { id: 'slot4', label: 'Gali Ruang ke-4', cost: { gold: 95, souls: 6 } },
  { id: 'slot5', label: 'Gali Ruang ke-5', cost: { gold: 160, souls: 14 } }
];
