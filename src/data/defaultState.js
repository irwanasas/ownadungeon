// The initial shape of persisted game state (used on first load and on reset).
export const DEFAULT_STATE = {
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
