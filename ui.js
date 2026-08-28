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

  requestAnimationFrame(function () {
    toast.classList.add('toast--show');
  });

  setTimeout(function () {
    toast.classList.remove('toast--show');
    setTimeout(function () {
      toast.remove();
    }, 280);
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

  card.classList.remove(
    'hero-card--panic',
    'hero-card--rage',
    'hero-card--flee',
    'hero-card--dead'
  );

  if (hero.visualState === 'panic') card.classList.add('hero-card--panic');
  if (hero.visualState === 'rage') card.classList.add('hero-card--rage');
  if (hero.visualState === 'flee') card.classList.add('hero-card--flee');
  if (hero.visualState === 'dead') card.classList.add('hero-card--dead');

  var iconEl = document.getElementById('hero-icon');
  if (iconEl) iconEl.textContent = getHeroIcon(hero);

  if (typeof syncHeroTokenVisual === 'function') syncHeroTokenVisual(hero);
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
  if (hpText) {
    hpText.textContent =
      'HP ' + Math.max(0, Math.floor(hero.hp)) + '/' + hero.maxHp;
  }

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
  var cls =
    kind === 'kill'
      ? 'slot-kill'
      : kind === 'cleared'
        ? 'slot-cleared-flash'
        : 'slot-triggered';
  slotEl.classList.add(cls);
  setTimeout(function () {
    slotEl.classList.remove(cls);
  }, 400);
}

function renderPalette() {
  var trapWrap = document.getElementById('palette-traps');
  var monsterWrap = document.getElementById('palette-monsters');
  var specialWrap = document.getElementById('palette-special');
  if (!trapWrap || !monsterWrap || !specialWrap) return;

  trapWrap.innerHTML = '';
  monsterWrap.innerHTML = '';
  specialWrap.innerHTML = '';

  var trapItems = Object.values(TRAPS);
  var monsterItems = Object.values(MONSTERS);
  var unlockedTraps = trapItems.filter(function (i) {
    return isUnlocked(i.id);
  });
  var unlockedMonsters = monsterItems.filter(function (i) {
    return isUnlocked(i.id);
  });

  if (unlockedTraps.length === 0) {
    trapWrap.innerHTML =
      '<div class="empty-state">Belum ada trap terbuka.<br>Buka di panel Peningkatan.</div>';
  } else {
    trapItems.forEach(function (item) {
      renderPaletteItem(item, trapWrap);
    });
  }

  if (unlockedMonsters.length === 0) {
    monsterWrap.innerHTML =
      '<div class="empty-state">Belum ada monster terbuka.<br>Buka di panel Peningkatan.</div>';
  } else {
    monsterItems.forEach(function (item) {
      renderPaletteItem(item, monsterWrap);
    });
  }

  renderPaletteItem(TREASURE, specialWrap, true);
}

function renderPaletteItem(item, wrap, alwaysUnlocked) {
  var unlocked = alwaysUnlocked || isUnlocked(item.id);
  var div = document.createElement('div');
  div.className = 'palette-item' + (unlocked ? '' : ' locked');
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', unlocked ? '0' : '-1');

  if (selectedPaletteItem && selectedPaletteItem.id === item.id) {
    div.classList.add('selected');
  }

  var levelTag =
    item.kind === 'trap' || item.kind === 'monster'
      ? '<div class="palette-item-level">Lv.' +
        (state.levels[item.id] || 1) +
        '</div>'
      : '';

  div.innerHTML =
    '<span class="palette-icon">' +
    item.icon +
    '</span>' +
    '<div class="palette-info">' +
    '<div class="palette-item-name">' +
    item.name +
    '</div>' +
    '<div class="palette-item-desc">' +
    (unlocked ? item.desc : 'Terkunci — buka di panel Peningkatan') +
    '</div></div>' +
    (unlocked ? levelTag : '');

  if (unlocked) {
    var selectItem = function () {
      selectedPaletteItem =
        selectedPaletteItem && selectedPaletteItem.id === item.id
          ? null
          : { id: item.id, kind: item.kind };
      renderPalette();
      if (selectedPaletteItem) {
        closeAllOverlays();
        showToast(item.name + ' dipilih — klik slot kosong', 'info');
      }
    };
    div.addEventListener('click', selectItem);
    div.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectItem();
      }
    });
  }

  wrap.appendChild(div);
}

function renderDungeonSlots() {
  var wrap = document.getElementById('dungeon-slots');
  if (!wrap) return;
  wrap.innerHTML = '';

  var entrance = document.createElement('div');
  entrance.className = 'dungeon-slot entrance';
  entrance.innerHTML =
    '<span class="slot-icon">🚪</span><span class="slot-label">Masuk</span>';
  wrap.appendChild(entrance);

  for (var i = 0; i < state.maxSlotCount; i++) {
    if (i > 0) {
      var connector = document.createElement('div');
      connector.className = 'slot-connector';
      wrap.appendChild(connector);
    }

    var locked = i >= state.slotCount;
    var slotData = state.dungeon[i];
    var slotEl = document.createElement('div');
    slotEl.className =
      'dungeon-slot' +
      (locked ? ' locked-slot' : '') +
      (slotData ? ' filled' : '');
    slotEl.dataset.index = i;

    var indexTag = '<span class="slot-index">' + (i + 1) + '</span>';

    if (locked) {
      slotEl.innerHTML =
        indexTag +
        '<span class="slot-icon">⛏</span><span class="slot-label">Terkunci</span>';
    } else if (slotData) {
      var cat = catalogFor(slotData.catalogId, slotData.kind);
      slotEl.innerHTML =
        indexTag +
        '<span class="slot-icon">' +
        cat.icon +
        '</span><span class="slot-label">' +
        cat.name +
        '</span>';
      (function (idx, c) {
        slotEl.addEventListener('click', function () {
          if (raidInProgress) return;
          state.dungeon[idx] = null;
          saveState();
          renderAll();
          showToast(c.name + ' dihapus', 'info');
        });
      })(i, cat);
    } else {
      slotEl.innerHTML =
        indexTag +
        '<span class="slot-icon">·</span><span class="slot-label">Kosong</span>';
      (function (idx) {
        slotEl.addEventListener('click', function () {
          if (raidInProgress || !selectedPaletteItem) return;
          var c = catalogFor(selectedPaletteItem.id, selectedPaletteItem.kind);
          state.dungeon[idx] = {
            catalogId: selectedPaletteItem.id,
            kind: selectedPaletteItem.kind
          };
          selectedPaletteItem = null;
          saveState();
          renderAll();
          showToast(c.name + ' dipasang', 'success');
        });
      })(i);
    }

    wrap.appendChild(slotEl);
  }
}

function renderUpgrades() {
  var wrap = document.getElementById('upgrade-list');
  if (!wrap) return;
  wrap.innerHTML = '';
  var hasAny = false;

  UPGRADE_DEFS.forEach(function (def) {
    if (def.requiresUnlock && !isUnlocked(def.requiresUnlock)) return;
    hasAny = true;
    var level = state.levels[def.id] || 1;
    var cost = { gold: upgradeCost(def.baseCost, level), souls: 0 };
    var can = affordable(cost);
    var div = document.createElement('div');
    div.className = 'upgrade-item';
    div.innerHTML =
      '<div class="upgrade-item-top"><span class="upgrade-item-name">' +
      def.label +
      '</span><span class="upgrade-item-level">Lv.' +
      level +
      '</span></div>' +
      '<div class="upgrade-item-cost">Biaya: ' +
      costLabel(cost) +
      '</div>' +
      '<div class="upgrade-btn-row"><button class="btn btn-small"' +
      (can ? '' : ' disabled') +
      '>Tingkatkan</button></div>';

    div.querySelector('button').addEventListener('click', function () {
      if (!affordable(cost)) return;
      spend(cost);
      state.levels[def.id] = level + 1;
      saveState();
      renderAll();
      showToast(def.label + ' → Lv.' + (level + 1), 'success');
    });
    wrap.appendChild(div);
  });

  UNLOCK_DEFS.forEach(function (def) {
    if (state.unlocked[def.id]) return;
    if (def.id === 'slot4' && state.slotCount !== 3) return;
    if (def.id === 'slot5' && state.slotCount !== 4) return;
    hasAny = true;
    var can = affordable(def.cost);
    var div = document.createElement('div');
    div.className = 'upgrade-item';
    div.innerHTML =
      '<div class="upgrade-item-top"><span class="upgrade-item-name">' +
      def.label +
      '</span></div>' +
      '<div class="upgrade-item-cost">Biaya: ' +
      costLabel(def.cost) +
      '</div>' +
      '<div class="upgrade-btn-row"><button class="btn btn-small"' +
      (can ? '' : ' disabled') +
      '>Buka</button></div>';

    div.querySelector('button').addEventListener('click', function () {
      if (!affordable(def.cost)) return;
      spend(def.cost);
      state.unlocked[def.id] = true;
      if (def.id === 'slot4') state.slotCount = 4;
      if (def.id === 'slot5') state.slotCount = 5;
      saveState();
      renderAll();
      showToast(def.label + ' berhasil!', 'success');
    });
    wrap.appendChild(div);
  });

  if (!hasAny) {
    wrap.innerHTML =
      '<div class="empty-state">Semua item sudah terbuka & max level untuk saat ini.</div>';
  }
}

function renderStats() {
  var wrap = document.getElementById('stats-list');
  if (!wrap) return;
  var s = state.stats;
  var rows = [
    ['Total Raid', s.raidsTotal],
    ['Dungeon Menang', s.dungeonWins],
    ['Hero Kabur', s.heroEscapes],
    ['Hero Menang', s.heroVictories]
  ];
  wrap.innerHTML = rows
    .map(function (r) {
      return (
        '<div class="stat-row"><span>' +
        r[0] +
        '</span><span>' +
        r[1] +
        '</span></div>'
      );
    })
    .join('');
}

function renderCurrencies() {
  var gold = document.getElementById('gold-value');
  var souls = document.getElementById('souls-value');
  if (gold) gold.textContent = Math.floor(state.gold);
  if (souls) souls.textContent = Math.floor(state.souls);
}

function renderAll() {
  renderCurrencies();
  renderPalette();
  renderDungeonSlots();
  renderUpgrades();
  renderStats();
  var startButton = document.getElementById('btn-start-raid');
  if (startButton) startButton.disabled = raidInProgress;
}

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

function openOverlay(which) {
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

function closeAllOverlays() {
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

function initOverlayControls() {
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

function showOfflineModal(summary) {
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

function init() {
  var offlineSummary = simulateOfflineProgress();
  renderAll();
  initOverlayControls();

  var startButton = document.getElementById('btn-start-raid');
  if (startButton) startButton.addEventListener('click', runRaid);

  var btnReset = document.getElementById('btn-reset-game');
  var resetModal = document.getElementById('reset-modal');
  var btnResetCancel = document.getElementById('btn-reset-cancel');
  var btnResetConfirm = document.getElementById('btn-reset-confirm');

  function openResetModal() {
    if (raidInProgress) {
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
      if (typeof resetGame === 'function') resetGame();
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

document.addEventListener('DOMContentLoaded', init);
