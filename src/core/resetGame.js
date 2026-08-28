// "Reset Game" orchestration: wipes persisted state and puts every part
// of the UI back into its just-loaded appearance.
import { resetState, saveState } from '../state/gameState.js';
import { runtime } from '../state/runtimeState.js';
import { hideHeroToken } from '../animation/heroToken.js';
import { clearRaidLog } from '../ui/raidLog.js';
import { renderAll } from '../ui/renderBus.js';
import { showToast } from '../ui/toast.js';

export function resetGame() {
  resetState();
  runtime.selectedPaletteItem = null;
  runtime.raidInProgress = false;
  hideHeroToken();
  clearRaidLog();
  var status = document.getElementById('raid-status');
  if (status) status.textContent = '';
  var card = document.getElementById('hero-card');
  if (card) {
    card.classList.add('hero-card--hidden');
    card.classList.remove('hero-card--panic', 'hero-card--rage', 'hero-card--flee', 'hero-card--dead');
  }
  var log = document.getElementById('raid-log');
  if (log) {
    log.innerHTML = '<p class="raid-log-placeholder">Susun dungeon-mu, lalu tekan "Mulai Raid" untuk melihat hero mencoba menaklukkannya.</p>';
  }
  saveState();
  renderAll();
  showToast('Game direset ke awal', 'warning');
}
