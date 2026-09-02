import type { OfflineProgressSummary } from '../types';

export function showOfflineModal(summary: OfflineProgressSummary): void {
  var modal = document.getElementById('offline-modal');
  var body = document.getElementById('offline-summary');
  if (!modal || !body) return;
  body.innerHTML =
    '<p>You were away for ~' +
    summary.hours +
    ' hours.</p>' +
    '<p>Offline simulation: <strong>' +
    summary.raids +
    '</strong> raids.</p>' +
    '<p>Dungeon wins: <strong>' +
    summary.wins +
    '</strong></p>' +
    '<p>Gold earned: <strong>+' +
    summary.gold +
    '</strong></p>' +
    '<p>Souls earned: <strong>+' +
    summary.souls +
    '</strong></p>';
  modal.classList.remove('modal-overlay--hidden');
}
