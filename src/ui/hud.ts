// Top-level HUD: currency readout, mode toggle + status strip, and the
// renderAll() aggregator that refreshes every panel after a state change.
import { state, saveState } from '../state/gameState';
import { runtime } from '../state/runtimeState';
import { getKingStats } from '../data/king';
import { STAGE_MAX } from '../data/difficulty';
import { showToast } from './toast';
import { registerRenderAll } from './renderBus';
import { renderPalette } from './palette';
import { renderDungeonSlots } from './dungeonSlots';
import { renderUpgrades } from './upgradesPanel';
import { renderStats } from './statsPanel';
import { renderRoomPreview } from './roomPreview';
import type { GameMode } from '../types';

export function renderCurrencies(): void {
  var gold = document.getElementById('gold-value');
  var souls = document.getElementById('souls-value');
  if (gold) gold.textContent = String(Math.floor(state.gold));
  if (souls) souls.textContent = String(Math.floor(state.souls));
}

export function renderModeStage(): void {
  var el = document.getElementById('mode-stage-label');
  var btnStage = document.getElementById('btn-mode-stage');
  var btnArcade = document.getElementById('btn-mode-arcade');
  if (btnStage) btnStage.classList.toggle('active', state.mode === 'stage');
  if (btnArcade) btnArcade.classList.toggle('active', state.mode === 'arcade');
  var max = STAGE_MAX;
  var modeText = state.mode === 'arcade' ? 'Arcade' : 'Stage';
  var progressText;
  if (state.mode === 'arcade') {
    progressText =
      'Wave ' + (state.arcadeWave || 1) + ' · Best ' + (state.arcadeBest || 0);
  } else {
    progressText =
      (state.stage || 1) +
      ' / ' +
      max +
      ' · Clear ' +
      (state.maxStageCleared || 0);
  }
  if (el) {
    el.textContent =
      state.mode === 'arcade'
        ? 'Arcade · ' + progressText
        : 'Stage ' + progressText;
    el.classList.remove('is-hidden');
  }
  var statusMode = document.getElementById('status-mode');
  var statusProgress = document.getElementById('status-progress');
  var statusKing = document.getElementById('status-king');
  if (statusMode) statusMode.textContent = modeText;
  if (statusProgress) statusProgress.textContent = progressText;
  if (statusKing) {
    var k = getKingStats(state.king && state.king.level);
    statusKing.textContent =
      'Lv.' + k.level + ' · ' + k.maxHp + ' HP · ' + k.atk + ' ATK · ' + k.def + ' DEF';
  }

  var hudLevel = document.getElementById('hud-king-level');
  var hudProgress = document.getElementById('hud-progress');
  if (hudLevel) {
    var kingLv = (state.king && state.king.level) || 1;
    hudLevel.textContent = 'Lv.' + kingLv;
  }
  if (hudProgress) {
    hudProgress.textContent =
      state.mode === 'arcade' ? progressText : 'Stage ' + progressText;
  }
}

export function setGameMode(mode: GameMode): void {
  if (runtime.raidInProgress) {
    showToast('Tunggu raid selesai', 'warning');
    return;
  }
  if (mode !== 'stage' && mode !== 'arcade') return;
  state.mode = mode;
  saveState();
  renderAll();
  showToast(mode === 'arcade' ? 'Arcade Mode' : 'Stage Mode', 'info');
}

export function renderAll(): void {
  renderCurrencies();
  renderModeStage();
  renderPalette();
  renderDungeonSlots();
  renderUpgrades();
  renderStats();
  renderRoomPreview();
  var startButton = document.getElementById('btn-start-raid') as HTMLButtonElement | null;
  if (startButton) startButton.disabled = runtime.raidInProgress;
}

registerRenderAll(renderAll);
