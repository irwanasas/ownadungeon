// The hero status card (name, class, level, HP bar, reaction banner) and
// the brief flash effect on a dungeon slot when it's triggered/cleared.
import { getHeroIcon } from './heroIcon';
import { syncHeroTokenVisual } from '../animation/heroToken';
import type { Hero } from '../types';

export function setReaction(text: string): void {
  var el = document.getElementById('hero-reaction');
  if (!el) return;
  el.textContent = text;
  el.className = 'hero-reaction';
  if (text.indexOf('RAGE') !== -1) el.classList.add('is-rage');
  else if (text.indexOf('PANIK') !== -1) el.classList.add('is-panic');
  else if (text.indexOf('KABUR') !== -1) el.classList.add('is-flee');
}

export function updateHeroCardVisual(hero: Hero | null): void {
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

  syncHeroTokenVisual(hero);
}

export function updateHeroCard(hero: Hero): void {
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

export function flashSlot(slotEl: Element | null, kind: 'kill' | 'cleared' | 'triggered'): void {
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
