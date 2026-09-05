import { EDITABLE_ROOMS, type DungeonConfig, type RoomContent } from './types';
import type { GameState } from './save';

export function upgradeCost(baseCost: number, currentLevel: number): number {
  return Math.round(baseCost * Math.pow(1.35, currentLevel - 1));
}

export function kingUpgradeCost(currentLevel: number): number {
  return Math.round(20 * Math.pow(1.4, currentLevel - 1));
}

export function toDungeonConfig(state: GameState): DungeonConfig {
  const rooms: RoomContent[] = state.dungeon.slice(0, EDITABLE_ROOMS).map((slot) => {
    if (slot.kind === 'trap') return { kind: 'trap', trapId: slot.trapId, level: state.trapLevels[slot.trapId] || 1 };
    if (slot.kind === 'monster') return { kind: 'monster', monsterId: slot.monsterId, level: state.monsterLevels[slot.monsterId] || 1 };
    return { kind: 'empty' };
  });
  return { rooms };
}
