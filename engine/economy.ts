import { EDITABLE_ROOMS, type DungeonConfig, type RoomContent } from './types';
import type { GameState } from './save';

// Upgrade cost curve, shared by traps and monsters: cheap early, ramps up.
export function upgradeCost(baseCost: number, currentLevel: number): number {
  return Math.round(baseCost * Math.pow(1.35, currentLevel - 1));
}

export function kingUpgradeCost(currentLevel: number): number {
  return Math.round(20 * Math.pow(1.4, currentLevel - 1));
}

// The saved dungeon layout stores only catalog ids; item level lives in the
// separate trapLevels/monsterLevels maps so leveling up an item doesn't
// require touching every room slot it's placed in.
export function toDungeonConfig(state: GameState): DungeonConfig {
  const rooms: RoomContent[] = state.dungeon.slice(0, EDITABLE_ROOMS).map((slot) => {
    if (slot.kind === 'trap') return { kind: 'trap', trapId: slot.trapId, level: state.trapLevels[slot.trapId] || 1 };
    if (slot.kind === 'monster') return { kind: 'monster', monsterId: slot.monsterId, level: state.monsterLevels[slot.monsterId] || 1 };
    return { kind: 'empty' };
  });
  return { rooms };
}
