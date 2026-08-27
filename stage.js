/* ========== STAGE B: hero walk along dungeon runway ========== */

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

  els.token.textContent =
    typeof getHeroIcon === 'function' ? getHeroIcon(hero) : (hero && hero.icon) || '⚔';
  els.token.className = 'hero-token is-visible';
  els.runway.classList.add('is-raiding');
  moveHeroToEntrance();
}

function hideHeroToken() {
  var els = getRunwayEls();
  if (!els.token || !els.runway) return;
  els.token.className = 'hero-token';
  els.token.style.removeProperty('--hero-x');
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
  if (!token.classList.contains('is-visible') && hero.visualState !== 'flee') {
    token.classList.add('is-visible');
  }

  token.textContent =
    typeof getHeroIcon === 'function' ? getHeroIcon(hero) : token.textContent;
}

function centerXWithin(el, ancestor) {
  if (!el || !ancestor) return 0;
  var x = 0;
  var node = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    node = node.parentElement;
  }
  return x + el.offsetWidth / 2;
}

function setHeroX(x) {
  var token = document.getElementById('hero-token');
  if (!token) return;
  token.style.setProperty('--hero-x', Math.round(x) + 'px');
}

function moveHeroToEntrance() {
  var els = getRunwayEls();
  if (!els.runway || !els.slots) return;
  var entrance = els.slots.querySelector('.dungeon-slot.entrance');
  if (entrance) {
    setHeroX(centerXWithin(entrance, els.runway));
    try {
      entrance.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    } catch (e) {}
  } else {
    setHeroX(40);
  }
}

function moveHeroToSlot(index) {
  var els = getRunwayEls();
  if (!els.runway) return;
  var slotEl = document.querySelector('.dungeon-slot[data-index="' + index + '"]');
  if (!slotEl) return;
  setHeroX(centerXWithin(slotEl, els.runway));
  try {
    slotEl.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  } catch (e) {}
}

function resetStageView() {
  hideHeroToken();
  document.querySelectorAll('.dungeon-slot').forEach(function (s) {
    s.classList.remove('raid-active', 'raid-cleared', 'slot-triggered', 'slot-kill');
  });
}
