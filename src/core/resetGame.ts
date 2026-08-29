// "Reset Game" orchestration: wipes persisted state and puts every part
// of the UI back into its just-loaded appearance.
import { resetState, saveState } from '../state/gameState';
import { runtime } from '../state/runtimeState';
import { hideHeroToken } from '../animation/heroToken';
import { clearRaidLog } from '../ui/raidLog';
import { renderAll } from '../ui/renderBus';
import { showToast } from '../ui/toast';

export function resetGame(): void {
  resetState();
  runtime.selectedPaletteItem = null;
  runtime.raidInProgress = false;
  hideHeroToken();
  clearRaidLog();
  var status = document.getElementById('raid-status');
  if (status) status.textContent = '';
  var preview = document.getElementById('room-preview');
  if (preview) {
    preview.classList.remove('room-preview--intro', 'room-preview--battle', 'is-panic', 'is-rage', 'is-flee', 'is-dead');
  }
  var log = document.getElementById('raid-log');
  if (log) {
    log.innerHTML = '<p class="raid-log-placeholder">Susun dungeon-mu, lalu tekan "Mulai Raid" untuk melihat hero mencoba menaklukkannya.</p>';
  }
  saveState();
  renderAll();
  showToast('Game direset ke awal', 'warning');
}
