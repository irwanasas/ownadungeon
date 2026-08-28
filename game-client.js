// Next.js client entry point: same boot sequence as the vanilla game.js
// orchestrator, but exported as a function so a React effect can call it
// once the DOM (rendered by GameApp.js) is mounted, instead of listening
// for DOMContentLoaded (which React's mount effect already guarantees).
import { saveState } from './src/state/gameState.js';
import { runtime } from './src/state/runtimeState.js';
import { simulateOfflineProgress } from './src/core/offlineProgress.js';
import { resetGame } from './src/core/resetGame.js';
import { runRaid } from './src/combat/raid.js';
import { renderAll } from './src/ui/renderBus.js';
import { setGameMode } from './src/ui/hud.js';
import { initOverlayControls } from './src/ui/overlays.js';
import { showOfflineModal } from './src/ui/offlineModal.js';
import { showToast } from './src/ui/toast.js';

export function startGame() {
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
        .classList.add('modal-overlay--hidden');
    });
  }

  if (offlineSummary) showOfflineModal(offlineSummary);

  window.addEventListener('beforeunload', saveState);
  setInterval(saveState, 30000);
}
