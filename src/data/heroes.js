// Hero archetypes and the name pool used when a raid spawns a new hero.
export const HERO_ARCHETYPES = [
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

export const NAME_POOL = [
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
