import type { Outcome, WorldModifiers } from '../types';

export function upgradeCost(baseCost: number, level: number): number {
  return Math.round(baseCost * 1.8 * Math.pow(1.5, level - 1));
}

export function kingSoulCost(level: number): number {
  return Math.round(3 * Math.pow(1.35, level - 1));
}

export function unlockSoulCost(goldCost: number, unlockStage: number, currentStage: number): number {
  const early = Math.max(0, unlockStage - currentStage);
  return Math.max(2, Math.round((goldCost / 5) * (1 + early * 0.35)));
}

export function raidRewards(
  outcome: Outcome,
  roomsEntered: number,
  tier: number,
  world?: WorldModifiers
): { gold: number; souls: number } {
  const scale = 1 + (tier - 1) * 0.11;
  const toll = roomsEntered * 4;
  const g = world ? world.gold : 1;
  const sl = world ? world.souls : 1;
  if (outcome === 'dungeonWin') {
    return { gold: Math.round((30 + toll) * scale * g), souls: Math.round((1 + Math.floor(tier / 3)) * sl) };
  }
  if (outcome === 'heroEscape') {
    return { gold: Math.round((11 + toll) * scale * g), souls: Math.round(1 * sl) };
  }
  return { gold: Math.round(5 * scale * g), souls: 0 };
}

export function toDungeon(state: {
  rooms: import('../types').RoomSlot[];
  levels: Record<string, number>;
  kingLevel: number;
}): import('../types').Dungeon {
  return {
    rooms: state.rooms.map((slot) => ({
      slot,
      level: slot.kind === 'empty' ? 1 : state.levels[slot.id] || 1
    })),
    kingLevel: state.kingLevel
  };
}
