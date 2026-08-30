// "Reset Game" orchestration: wipes persisted state and puts every part
// of the UI back to a fresh first-run look.
import { resetState } from '../state/gameState';
import { clearPendingHero } from '../combat/hero';
import { renderAll } from '../ui/renderBus';
import { showToast } from '../ui/toast';
import { closeAllOverlays } from '../ui/overlays';

export function resetGame(): void {
  closeAllOverlays();
  resetState();
  clearPendingHero();
  renderAll();

  var log = document.getElementById('raid-log');
  if (log) {
    log.innerHTML =
      '<p class="raid-log-placeholder">Check Enemy Detected, set traps and monsters, then start the Raid.</p>';
  }
  var status = document.getElementById('raid-status');
  if (status) status.textContent = '';

  showToast('Game reset to the beginning', 'warning');
}
