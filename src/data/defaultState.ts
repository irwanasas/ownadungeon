import type { GameState } from '../types';

export const DEFAULT_STATE: GameState = {
  gold: 55,
  souls: 0,
  slotCount: 3,
  maxSlotCount: 5,
  dungeon: [null, null, null],
  levels: {
    spike: 1,
    poison: 1,
    net: 1,
    fire: 1,
    frost: 1,
    slime: 1,
    goblin_troop: 1,
    goblin_shaman: 1,
    goblin_elite: 1,
    orc: 1
  },
  unlocked: {
    spike: true,
    poison: false,
    net: false,
    fire: false,
    frost: false,
    slime: true,
    goblin_troop: false,
    goblin_shaman: false,
    goblin_elite: false,
    orc: false,
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
