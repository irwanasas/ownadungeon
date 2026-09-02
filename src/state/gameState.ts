import { DEFAULT_STATE } from '../data/defaultState';
import { STAGE_MAX } from '../data/difficulty';
import type { GameState } from '../types';

const STORAGE_KEY = 'idm_state_v1';

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw) as Partial<GameState>;
    var next: GameState = Object.assign(structuredClone(DEFAULT_STATE), parsed);
    if (!next.king || typeof next.king.level !== 'number') {
      next.king = structuredClone(DEFAULT_STATE.king);
    }
    if (!next.stats) next.stats = structuredClone(DEFAULT_STATE.stats);
    if (!next.mode) next.mode = 'stage';
    if (typeof next.stage !== 'number' || next.stage < 1) next.stage = 1;
    if (next.stage > STAGE_MAX) next.stage = STAGE_MAX;
    if (typeof next.maxStageCleared !== 'number') next.maxStageCleared = 0;
    if (typeof next.arcadeWave !== 'number' || next.arcadeWave < 1) next.arcadeWave = 1;
    if (typeof next.arcadeBest !== 'number') next.arcadeBest = 0;
    if (next.mode !== 'stage' && next.mode !== 'arcade') next.mode = 'stage';
    next.unlocked = Object.assign({}, DEFAULT_STATE.unlocked, next.unlocked || {});
    next.levels = Object.assign({}, DEFAULT_STATE.levels, next.levels || {});
    return next;
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export let state: GameState = loadState();

export function saveState(): void {
  state.lastActive = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): GameState {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(DEFAULT_STATE);
  return state;
}
