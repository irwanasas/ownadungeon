// Moves the hero token sprite along the dungeon runway and keeps its
// visual state (idle/panic/rage/flee/dead) in sync during a raid.
import { getHeroIcon } from '../ui/heroIcon.js';

function getRunwayEls() {
  return {
    runway: document.getElementById('dungeon-runway'),
    token: document.getElementById('hero-token'),
    slots: document.getElementById('dungeon-slots')
  };
}

export function showHeroToken(hero) {
  var els = getRunwayEls();
  if (!els.token || !els.runway) return;

  var inner = els.token.querySelector('.hero-token-face');
  if (inner) {
    inner.textContent = getHeroIcon(hero);
  }

  els.token.classList.add('is-visible');
  els.token.classList.remove('is-flee', 'is-dead');
  els.runway.classList.add('is-raiding');
  requestAnimationFrame(function () {
    moveHeroToEntrance(true);
  });
}

export function hideHeroToken() {
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

export function syncHeroTokenVisual(hero) {
  var token = document.getElementById('hero-token');
  if (!token || !hero) return;

  token.classList.remove('is-panic', 'is-rage', 'is-flee', 'is-dead');
  if (hero.visualState === 'panic') token.classList.add('is-panic');
  if (hero.visualState === 'rage') token.classList.add('is-rage');
  if (hero.visualState === 'flee') token.classList.add('is-flee');
  if (hero.visualState === 'dead') token.classList.add('is-dead');

  var face = token.querySelector('.hero-token-face');
  if (face) {
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

export function moveHeroToEntrance(instant) {
  var els = getRunwayEls();
  if (!els.runway || !els.slots) return;
  var entrance = els.slots.querySelector('.dungeon-slot.entrance');
  if (entrance) {
    repositionHeroOver(entrance, !!instant);
  } else {
    setHeroLeft(48);
  }
}

export function moveHeroToSlot(index, instant) {
  var slotEl = document.querySelector('.dungeon-slot[data-index="' + index + '"]');
  if (!slotEl) return;
  repositionHeroOver(slotEl, !!instant);
}

export function moveHeroToThrone(instant) {
  var slotEl = document.querySelector('.dungeon-slot.throne-room');
  if (!slotEl) return;
  repositionHeroOver(slotEl, !!instant);
}

export function refreshHeroTokenPosition() {
  var token = document.getElementById('hero-token');
  if (!token || !token.classList.contains('is-visible')) return;
  var active = document.querySelector('.dungeon-slot.raid-active');
  if (active) {
    repositionHeroOver(active, true);
  } else {
    moveHeroToEntrance(true);
  }
}

// Unused by the current UI flow (kept from the pre-refactor stage.js —
// flagged in the refactor audit as dead code rather than removed).
export function resetStageView() {
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
