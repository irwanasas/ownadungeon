// Currency, cost, and per-item-level bookkeeping shared by the raid
// simulation and the upgrades panel.
import { state, saveState } from '../state/gameState.js';
import { kingUpgradeCost } from '../data/king.js';

export function isUnlocked(id) {
  if (id === 'spike' || id === 'skeleton' || id === 'treasure') return true;
  return !!state.unlocked[id];
}

export function getItemLevel(catalogId) {
  return state.levels[catalogId] || 1;
}

export function affordable(cost) {
  return state.gold >= (cost.gold || 0) && state.souls >= (cost.souls || 0);
}

export function spend(cost) {
  state.gold -= cost.gold || 0;
  state.souls -= cost.souls || 0;
}

export function costLabel(cost) {
  const parts = [];
  if (cost.gold) parts.push(cost.gold + 'g');
  if (cost.souls) parts.push(cost.souls + 's');
  return parts.length ? parts.join(' + ') : 'Gratis';
}

export function upgradeCost(baseCost, level) {
  return Math.round(baseCost * Math.pow(1.5, level - 1));
}

export function tryUpgradeKing() {
  if (!state.king) state.king = { level: 1 };
  var level = state.king.level || 1;
  var cost = kingUpgradeCost(level);
  if (!affordable(cost)) return false;
  spend(cost);
  state.king.level = level + 1;
  saveState();
  return true;
}
