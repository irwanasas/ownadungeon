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

  var status = document.getElementById('raid-status');
  if (status) status.textContent = '';

  showToast('Game reset to the beginning', 'warning');
}
