import { saveState } from './src/state/gameState';
import { runtime } from './src/state/runtimeState';
import { simulateOfflineProgress } from './src/core/offlineProgress';
import { resetGame } from './src/core/resetGame';
import { runRaid } from './src/combat/raid';
import { renderAll } from './src/ui/renderBus';
import { setGameMode } from './src/ui/hud';
import { initOverlayControls } from './src/ui/overlays';
import { showOfflineModal } from './src/ui/offlineModal';
import { showToast } from './src/ui/toast';

export function startGame(): void {
  var offlineSummary = simulateOfflineProgress();
  renderAll();
  initOverlayControls();

  var startButton = document.getElementById('btn-start-raid');
  if (startButton) startButton.addEventListener('click', runRaid);

  var btnModeStage = document.getElementById('btn-mode-stage');
  var btnModeArcade = document.getElementById('btn-mode-arcade');
  if (btnModeStage) {
    btnModeStage.addEventListener('click', function () {
      setGameMode('stage');
    });
  }
  if (btnModeArcade) {
    btnModeArcade.addEventListener('click', function () {
      setGameMode('arcade');
    });
  }

  var btnReset = document.getElementById('btn-reset-game');
  var resetModal = document.getElementById('reset-modal');
  var btnResetCancel = document.getElementById('btn-reset-cancel');
  var btnResetConfirm = document.getElementById('btn-reset-confirm');

  function openResetModal() {
    if (runtime.raidInProgress) {
      showToast('Tunggu raid selesai dulu', 'warning');
      return;
    }
    if (resetModal) resetModal.classList.remove('modal-overlay--hidden');
  }

  function closeResetModal() {
    if (resetModal) resetModal.classList.add('modal-overlay--hidden');
  }

  if (btnReset) btnReset.addEventListener('click', openResetModal);
  if (btnResetCancel) btnResetCancel.addEventListener('click', closeResetModal);
  if (btnResetConfirm) {
    btnResetConfirm.addEventListener('click', function () {
      closeResetModal();
      resetGame();
    });
  }
  if (resetModal) {
    resetModal.addEventListener('click', function (e) {
      if (e.target === resetModal) closeResetModal();
    });
  }

  var closeOffline = document.getElementById('btn-close-offline');
  if (closeOffline) {
    closeOffline.addEventListener('click', function () {
      document
        .getElementById('offline-modal')
        ?.classList.add('modal-overlay--hidden');
    });
  }

  if (offlineSummary) showOfflineModal(offlineSummary);

  window.addEventListener('beforeunload', saveState);
  setInterval(saveState, 30000);
}
