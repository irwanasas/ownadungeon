// Top-level HUD: currency readout, mode toggle + status strip, and the
// renderAll() aggregator that refreshes every panel after a state change.
import { state, saveState } from '../state/gameState.js';
import { runtime } from '../state/runtimeState.js';
import { getKingStats } from '../data/king.js';
import { STAGE_MAX } from '../data/difficulty.js';
import { showToast } from './toast.js';
import { registerRenderAll } from './renderBus.js';
import { renderPalette } from './palette.js';
import { renderDungeonSlots } from './dungeonSlots.js';
import { renderUpgrades } from './upgradesPanel.js';
import { renderStats } from './statsPanel.js';

export function renderCurrencies() {
  var gold = document.getElementById('gold-value');
  var souls = document.getElementById('souls-value');
  if (gold) gold.textContent = Math.floor(state.gold);
  if (souls) souls.textContent = Math.floor(state.souls);
}

export function renderModeStage() {
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
}

export function setGameMode(mode) {
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

export function renderAll() {
  renderCurrencies();
  renderModeStage();
  renderPalette();
  renderDungeonSlots();
  renderUpgrades();
  renderStats();
  var startButton = document.getElementById('btn-start-raid');
  if (startButton) startButton.disabled = runtime.raidInProgress;
}

registerRenderAll(renderAll);
