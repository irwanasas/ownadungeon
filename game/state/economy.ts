import type { Outcome } from '../types';

export function upgradeCost(baseCost: number, level: number): number {
  return Math.round(baseCost * 1.8 * Math.pow(1.5, level - 1));
}

export function kingSoulCost(level: number): number {
  return Math.max(2, Math.round(2 + (level - 1) * 1.7));
}

export function unlockSoulCost(goldCost: number): number {
  return Math.max(2, Math.round(goldCost / 5));
}

export function raidRewards(outcome: Outcome, roomsEntered: number, tier: number): { gold: number; souls: number } {
  const scale = 1 + (tier - 1) * 0.11;
  const toll = roomsEntered * 4;
  if (outcome === 'dungeonWin') {
    return { gold: Math.round((30 + toll) * scale), souls: 2 + Math.floor(tier / 4) };
  }
  if (outcome === 'heroEscape') {
    return { gold: Math.round((11 + toll) * scale), souls: 1 };
  }
  return { gold: Math.round(5 * scale), souls: 0 };
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
