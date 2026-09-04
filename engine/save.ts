import { EDITABLE_ROOMS } from './types';

export type DungeonSlot = { kind: 'empty' } | { kind: 'trap'; trapId: string } | { kind: 'monster'; monsterId: string };

export interface GameState {
  gold: number;
  souls: number;
  mode: 'stage' | 'arcade';
  stage: number;
  maxStageCleared: number;
  arcadeWave: number;
  arcadeBest: number;
  kingLevel: number;
  dungeon: DungeonSlot[];
  trapLevels: Record<string, number>;
  monsterLevels: Record<string, number>;
  unlockedTraps: string[];
  unlockedMonsters: string[];
  stats: { raids: number; dungeonWins: number; heroEscapes: number; heroVictories: number };
}

const STORAGE_KEY = 'dungeon_forge_v1';

export function defaultState(): GameState {
  return {
    gold: 20,
    souls: 0,
    mode: 'stage',
    stage: 1,
    maxStageCleared: 0,
    arcadeWave: 1,
    arcadeBest: 0,
    kingLevel: 1,
    dungeon: Array.from({ length: EDITABLE_ROOMS }, () => ({ kind: 'empty' })),
    trapLevels: {},
    monsterLevels: {},
    unlockedTraps: ['spike'],
    unlockedMonsters: [],
    stats: { raids: 0, dungeonWins: 0, heroEscapes: 0, heroVictories: 0 }
  };
}

export function loadState(): GameState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const merged: GameState = { ...defaultState(), ...parsed };
    const dungeon = merged.dungeon.slice(0, EDITABLE_ROOMS);
    while (dungeon.length < EDITABLE_ROOMS) dungeon.push({ kind: 'empty' });
    merged.dungeon = dungeon;
    return merged;
  } catch (e) {
    return defaultState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // storage can be unavailable (private mode, quota) — saving is best-effort
  }
}

export function resetState(): GameState {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
  return defaultState();
}
