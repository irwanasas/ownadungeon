/* ========== STAGE B: hero token on runway + beat helpers ========== */

var STAGE_BEAT = {
  enterDungeon: 850,
  arriveRoom: 750,
  threat: 800,
  actionGap: 700,
  combatRound: 950,
  resolve: 850,
  betweenRooms: 650,
  ending: 1100,
  /** ± fraction of base (0.3 = 70%–130%) */
  jitter: 0.3
};

/** Wait a named beat with random jitter so pacing feels less robotic. */
function beatWait(key) {
  var base = (STAGE_BEAT && STAGE_BEAT[key]) || 500;
  var j = (STAGE_BEAT && STAGE_BEAT.jitter) || 0.25;
  var factor = 1 + (Math.random() * 2 - 1) * j;
  var ms = Math.max(120, Math.round(base * factor));
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}

function getRunwayEls() {
  return {
    runway: document.getElementById('dungeon-runway'),
    token: document.getElementById('hero-token'),
    slots: document.getElementById('dungeon-slots')
  };
}

function showHeroToken(hero) {
  var els = getRunwayEls();
  if (!els.token || !els.runway) return;

  var inner = els.token.querySelector('.hero-token-face');
  if (inner) {
    inner.textContent =
      typeof getHeroIcon === 'function' ? getHeroIcon(hero) : (hero && hero.icon) || '⚔';
  }

  els.token.classList.add('is-visible');
  els.token.classList.remove('is-flee', 'is-dead');
  els.runway.classList.add('is-raiding');
  requestAnimationFrame(function () {
    moveHeroToEntrance(true);
  });
}

function hideHeroToken() {
  var els = getRunwayEls();
  if (!els.token || !els.runway) return;
  els.token.classList.remove(
    'is-visible',
    'is-panic',
    'is-rage',
    'is-flee',
    'is-dead'
  );
  els.token.style.left = '';
  els.runway.classList.remove('is-raiding');
}

function syncHeroTokenVisual(hero) {
  var token = document.getElementById('hero-token');
  if (!token || !hero) return;

  token.classList.remove('is-panic', 'is-rage', 'is-flee', 'is-dead');
  if (hero.visualState === 'panic') token.classList.add('is-panic');
  if (hero.visualState === 'rage') token.classList.add('is-rage');
  if (hero.visualState === 'flee') token.classList.add('is-flee');
  if (hero.visualState === 'dead') token.classList.add('is-dead');

  var face = token.querySelector('.hero-token-face');
  if (face && typeof getHeroIcon === 'function') {
    face.textContent = getHeroIcon(hero);
  }
}

function slotCenterLeft(slotEl, runway) {
  if (!slotEl || !runway) return 0;
  var sr = slotEl.getBoundingClientRect();
  var rr = runway.getBoundingClientRect();
  return sr.left - rr.left + sr.width / 2;
}

function setHeroLeft(px) {
  var token = document.getElementById('hero-token');
  if (!token) return;
  token.style.left = Math.round(px) + 'px';
}

function repositionHeroOver(slotEl, instant) {
  var els = getRunwayEls();
  if (!els.runway || !slotEl) return;

  if (instant && els.token) {
    els.token.classList.add('no-motion');
  }

  try {
    slotEl.scrollIntoView({
      inline: 'center',
      behavior: instant ? 'auto' : 'smooth',
      block: 'nearest'
    });
  } catch (e) {}

  var apply = function () {
    setHeroLeft(slotCenterLeft(slotEl, els.runway));
    if (els.token) els.token.classList.remove('no-motion');
  };

  if (instant) {
    requestAnimationFrame(apply);
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(apply);
    });
    setTimeout(apply, 320);
  }
}

function moveHeroToEntrance(instant) {
  var els = getRunwayEls();
  if (!els.runway || !els.slots) return;
  var entrance = els.slots.querySelector('.dungeon-slot.entrance');
  if (entrance) {
    repositionHeroOver(entrance, !!instant);
  } else {
    setHeroLeft(48);
  }
}

function moveHeroToSlot(index, instant) {
  var slotEl = document.querySelector('.dungeon-slot[data-index="' + index + '"]');
  if (!slotEl) return;
  repositionHeroOver(slotEl, !!instant);
}

function refreshHeroTokenPosition() {
  var token = document.getElementById('hero-token');
  if (!token || !token.classList.contains('is-visible')) return;
  var active = document.querySelector('.dungeon-slot.raid-active');
  if (active) {
    repositionHeroOver(active, true);
  } else {
    moveHeroToEntrance(true);
  }
}

function resetStageView() {
  hideHeroToken();
  document.querySelectorAll('.dungeon-slot').forEach(function (s) {
    s.classList.remove('raid-active', 'raid-cleared', 'slot-triggered', 'slot-kill');
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'resize',
    function () {
      refreshHeroTokenPosition();
    },
    { passive: true }
  );
}
