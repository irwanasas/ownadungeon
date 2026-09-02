import { state, saveState } from '../state/gameState';
import { kingUpgradeCost } from '../data/king';
import type { Cost } from '../types';

export function isUnlocked(id: string): boolean {
  if (id === 'spike' || id === 'slime' || id === 'treasure') return true;
  return !!state.unlocked[id];
}

export function getItemLevel(catalogId: string): number {
  return state.levels[catalogId] || 1;
}

export function affordable(cost: Cost): boolean {
  return state.gold >= (cost.gold || 0) && state.souls >= (cost.souls || 0);
}

export function spend(cost: Cost): void {
  state.gold -= cost.gold || 0;
  state.souls -= cost.souls || 0;
}

export function costLabel(cost: Cost): string {
  const parts: string[] = [];
  if (cost.gold) parts.push(cost.gold + 'g');
  if (cost.souls) parts.push(cost.souls + 's');
  return parts.length ? parts.join(' + ') : 'Gratis';
}

export function upgradeCost(baseCost: number, level: number): number {
  return Math.round(baseCost * Math.pow(1.5, level - 1));
}

export function tryUpgradeKing(): boolean {
  if (!state.king) state.king = { level: 1 };
  var level = state.king.level || 1;
  var cost = kingUpgradeCost(level);
  if (!affordable(cost)) return false;
  spend(cost);
  state.king.level = level + 1;
  saveState();
  return true;
}
