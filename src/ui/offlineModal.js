// The "Selagi Kau Pergi..." modal shown on load when offline progress
// was simulated.
export function showOfflineModal(summary) {
  var modal = document.getElementById('offline-modal');
  var body = document.getElementById('offline-summary');
  if (!modal || !body) return;
  body.innerHTML =
    '<p>Kamu pergi selama ~' +
    summary.hours +
    ' jam.</p>' +
    '<p>Simulasi offline: <strong>' +
    summary.raids +
    '</strong> raid.</p>' +
    '<p>Dungeon menang: <strong>' +
    summary.wins +
    '</strong></p>' +
    '<p>Gold didapat: <strong>+' +
    summary.gold +
    '</strong></p>' +
    '<p>Souls didapat: <strong>+' +
    summary.souls +
    '</strong></p>';
  modal.classList.remove('modal-overlay--hidden');
}
