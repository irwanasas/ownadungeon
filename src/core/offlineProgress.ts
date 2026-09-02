import { state, saveState } from '../state/gameState';
import type { OfflineProgressSummary } from '../types';

export function simulateOfflineProgress(): OfflineProgressSummary | null {
  var now = Date.now();
  var elapsed = now - (state.lastActive || now);
  var hours = elapsed / (1000 * 60 * 60);
  if (hours < 0.25) return null;
  var raids = Math.min(12, Math.floor(hours * 1.8));
  if (raids < 1) return null;
  var gold = 0, souls = 0, wins = 0;
  for (var i = 0; i < raids; i++) {
    if (Math.random() < 0.55) {
      wins++;
      gold += 22 + state.slotCount * 6;
      if (Math.random() < 0.25) souls += 1;
    } else gold += 8;
  }
  state.gold += gold;
  state.souls += souls;
  state.stats.raidsTotal += raids;
  state.stats.dungeonWins += wins;
  saveState();
  return { raids: raids, gold: gold, souls: souls, wins: wins, hours: hours.toFixed(1) };
}
