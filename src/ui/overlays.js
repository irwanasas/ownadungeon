// Slide-in side panels (Gudang Dungeon / Peningkatan / Statistik): open,
// close, focus trapping, and swipe-to-close gestures.
let currentOverlay = null;
let lastFocusedBeforeOverlay = null;

var OVERLAY_MAP = {
  palette: { id: 'palette-overlay', btn: 'btn-open-palette' },
  upgrades: { id: 'upgrades-overlay', btn: 'btn-open-upgrades' },
  stats: { id: 'stats-overlay', btn: 'btn-open-stats' }
};

function updateActiveButtons() {
  Object.keys(OVERLAY_MAP).forEach(function (key) {
    var meta = OVERLAY_MAP[key];
    var btn = document.getElementById(meta.btn);
    if (!btn) return;
    var isActive = currentOverlay === key;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });
}

function getFocusable(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter(function (el) {
    return el.offsetParent !== null;
  });
}

function trapFocus(e) {
  if (!currentOverlay) return;
  var meta = OVERLAY_MAP[currentOverlay];
  if (!meta) return;
  var panel = document.querySelector('#' + meta.id + ' .side-panel');
  if (!panel) return;
  var focusable = getFocusable(panel);
  if (focusable.length === 0) return;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

export function openOverlay(which) {
  closeAllOverlays();
  var meta = OVERLAY_MAP[which];
  if (!meta) return;
  var el = document.getElementById(meta.id);
  if (!el) return;

  lastFocusedBeforeOverlay = document.activeElement;
  currentOverlay = which;
  el.classList.remove('side-overlay--hidden');
  el.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-active');
  updateActiveButtons();

  requestAnimationFrame(function () {
    var panel = el.querySelector('.side-panel');
    if (panel) {
      var focusable = getFocusable(panel);
      if (focusable.length) focusable[0].focus();
      else panel.focus();
    }
  });
}

export function closeAllOverlays() {
  document.querySelectorAll('.side-overlay').forEach(function (el) {
    el.classList.add('side-overlay--hidden');
    el.setAttribute('aria-hidden', 'true');
  });
  document.body.classList.remove('overlay-active');
  currentOverlay = null;
  updateActiveButtons();
  if (
    lastFocusedBeforeOverlay &&
    typeof lastFocusedBeforeOverlay.focus === 'function'
  ) {
    lastFocusedBeforeOverlay.focus();
  }
  lastFocusedBeforeOverlay = null;
}

function initSwipeToClose() {
  document.querySelectorAll('.side-panel').forEach(function (panel) {
    var startX = 0;
    var startY = 0;
    var tracking = false;

    panel.addEventListener(
      'touchstart',
      function (e) {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      },
      { passive: true }
    );

    panel.addEventListener(
      'touchmove',
      function (e) {
        if (!tracking || e.touches.length !== 1) return;
        var dx = e.touches[0].clientX - startX;
        var dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          var isLeft = panel.closest('.side-overlay-left');
          var isRight = panel.closest('.side-overlay-right');
          if ((isLeft && dx < -50) || (isRight && dx > 50)) {
            tracking = false;
            closeAllOverlays();
          }
        }
      },
      { passive: true }
    );

    panel.addEventListener(
      'touchend',
      function () {
        tracking = false;
      },
      { passive: true }
    );
  });
}

export function initOverlayControls() {
  var btnPalette = document.getElementById('btn-open-palette');
  var btnUpgrades = document.getElementById('btn-open-upgrades');
  var btnStats = document.getElementById('btn-open-stats');
  var btnClosePalette = document.getElementById('btn-close-palette');
  var btnCloseUpgrades = document.getElementById('btn-close-upgrades');
  var btnCloseStats = document.getElementById('btn-close-stats');

  if (btnPalette)
    btnPalette.addEventListener('click', function () {
      openOverlay('palette');
    });
  if (btnUpgrades)
    btnUpgrades.addEventListener('click', function () {
      openOverlay('upgrades');
    });
  if (btnStats)
    btnStats.addEventListener('click', function () {
      openOverlay('stats');
    });
  if (btnClosePalette) btnClosePalette.addEventListener('click', closeAllOverlays);
  if (btnCloseUpgrades)
    btnCloseUpgrades.addEventListener('click', closeAllOverlays);
  if (btnCloseStats) btnCloseStats.addEventListener('click', closeAllOverlays);

  document.querySelectorAll('[data-close-overlay]').forEach(function (el) {
    el.addEventListener('click', closeAllOverlays);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllOverlays();
    trapFocus(e);
  });

  initSwipeToClose();
}
