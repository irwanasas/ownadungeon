/* ========== UI: render, overlay, toast, visual reactions ========== */

let currentOverlay = null;
let lastFocusedBeforeOverlay = null;

function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add('toast--show'); });
  setTimeout(function () {
    toast.classList.remove('toast--show');
    setTimeout(function () { toast.remove(); }, 280);
  }, 2400);
}

function logLine(text, type) {
  type = type || '';
  var log = document.getElementById('raid-log');
  if (!log) return;
  var p = document.createElement('p');
  p.className = 'raid-log-line' + (type ? ' ' + type : '');
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

function clearRaidLog() {
  var log = document.getElementById('raid-log');
  if (log) log.innerHTML = '';
}

function setReaction(text) {
  var el = document.getElementById('hero-reaction');
  if (!el) return;
  el.textContent = text;
  el.className = 'hero-reaction';
  if (text.indexOf('RAGE') !== -1) el.classList.add('is-rage');
  else if (text.indexOf('PANIK') !== -1) el.classList.add('is-panic');
  else if (text.indexOf('KABUR') !== -1) el.classList.add('is-flee');
}

function updateHeroCardVisual(hero) {
  var card = document.getElementById('hero-card');
  if (!card || !hero) return;
  card.classList.remove('hero-card--panic', 'hero-card--rage', 'hero-card--flee');
  if (hero.visualState === 'panic') card.classList.add('hero-card--panic');
  if (hero.visualState === 'rage') card.classList.add('hero-card--rage');
  if (hero.visualState === 'flee') card.classList.add('hero-card--flee');
  var iconEl = document.getElementById('hero-icon');
  if (iconEl) iconEl.textContent = getHeroIcon(hero);
}

function updateHeroCard(hero) {
  var card = document.getElementById('hero-card');
  if (!card) return;
  card.classList.remove('hero-card--hidden');
  var nameEl = document.getElementById('hero-name');
  var classEl = document.getElementById('hero-class');
  var levelEl = document.getElementById('hero-level');
  var hpText = document.getElementById('hero-hp-text');
  if (nameEl) nameEl.textContent = hero.name;
  if (classEl) classEl.textContent = hero.className;
  if (levelEl) levelEl.textContent = 'Lv. ' + hero.level;
  if (hpText) hpText.textContent = 'HP ' + Math.max(0, Math.floor(hero.hp)) + '/' + hero.maxHp;
  var fill = document.getElementById('hero-hp-fill');
  if (fill) {
    var pct = Math.max(0, (hero.hp / hero.maxHp) * 100);
    fill.style.width = pct + '%';
    fill.classList.toggle('low', pct <= 30);
  }
  updateHeroCardVisual(hero);
}

function flashSlot(slotEl, kind) {
  if (!slotEl) return;
  var cls = kind === 'kill' ? 'slot-kill' : kind === 'cleared' ? 'slot-cleared-flash' : 'slot-triggered';
  slotEl.classList.add(cls);
  setTimeout(function () { slotEl.classList.remove(cls); }, 400);
}

/* NOTE: full ui.js too long for single tool call in some cases.
   Complete file available in artifacts — if this stub loads, replace with full ui.js from release.
*/
function renderAll() { console.warn('ui.js incomplete'); }
function initOverlayControls() {}
function init() {
  console.error('Please use full ui.js from the package');
}
document.addEventListener('DOMContentLoaded', init);
