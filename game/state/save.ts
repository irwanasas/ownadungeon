import type { HeroRecord, RoomSlot } from '../types';
import { EDITABLE_ROOMS } from '../types';
import { STAGES } from '../content/stages';

export interface GameStats {
  raids: number;
  defeated: number;
  escaped: number;
  lost: number;
  goldEarned: number;
  goldStolen: number;
}

export interface GameState {
  gold: number;
  souls: number;
  mode: 'stage' | 'arcade';
  stage: number;
  maxStageCleared: number;
  wave: number;
  bestWave: number;
  kingLevel: number;
  rooms: RoomSlot[];
  levels: Record<string, number>;
  unlocked: string[];
  bought: string[];
  stats: GameStats;
  roster: HeroRecord[];
  tutorial: number;
  lastSeenAt: number;
}

const KEY = 'own_a_dungeon_v1';

export function unlockedFor(stage: number): string[] {
  const ids = new Set<string>(['spike']);
  for (const s of STAGES) {
    if (s.id > stage) break;
    s.unlockTraps.forEach((id) => ids.add(id));
    s.unlockMonsters.forEach((id) => ids.add(id));
    s.unlockTreasure.forEach((id) => ids.add(id));
  }
  return [...ids];
}

export function emptyRooms(): RoomSlot[] {
  return Array.from({ length: EDITABLE_ROOMS }, () => ({ kind: 'empty' as const }));
}

export function defaultState(): GameState {
  return {
    gold: 30,
    souls: 0,
    mode: 'stage',
    stage: 1,
    maxStageCleared: 0,
    wave: 1,
    bestWave: 0,
    kingLevel: 1,
    rooms: emptyRooms(),
    levels: {},
    unlocked: unlockedFor(1),
    bought: [],
    stats: { raids: 0, defeated: 0, escaped: 0, lost: 0, goldEarned: 0, goldStolen: 0 },
    roster: [],
    tutorial: 0,
    lastSeenAt: Date.now()
  };
}

export function normalize(input: Partial<GameState> | null): GameState {
  const base = defaultState();
  if (!input) return base;
  const merged: GameState = {
    ...base,
    ...input,
    stats: { ...base.stats, ...(input.stats || {}) },
    levels: { ...(input.levels || {}) },
    roster: Array.isArray(input.roster) ? input.roster : [],
    bought: Array.isArray(input.bought) ? input.bought : []
  };
  const rooms = Array.isArray(input.rooms) ? input.rooms.slice(0, EDITABLE_ROOMS) : [];
  while (rooms.length < EDITABLE_ROOMS) rooms.push({ kind: 'empty' });
  merged.rooms = rooms;
  merged.stage = Math.max(1, Math.min(STAGES.length, merged.stage));
  merged.unlocked = [...new Set([...unlockedFor(Math.max(merged.stage, merged.maxStageCleared + 1)), ...merged.bought])];
  return merged;
}

export function loadState(): GameState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

export function levelOf(state: GameState, id: string): number {
  return state.levels[id] || 1;
}
