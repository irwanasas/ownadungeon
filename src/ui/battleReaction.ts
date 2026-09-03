import { getHeroIcon } from './heroIcon';
import { syncHeroTokenVisual } from '../animation/heroToken';
import type { Hero, ReactionKind } from '../types';

export function setBattleReaction(text: string, kind: ReactionKind): void {
  var el = document.getElementById('battle-card-reaction');
  if (!el) return;
  el.textContent = text || '';
  el.className = 'battle-card-reaction';
  if (kind && kind !== 'none') el.classList.add('is-' + kind);
}

export function syncBattleCardVisual(hero: Hero | null): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap || !hero || !wrap.classList.contains('room-preview--battle')) return;

  wrap.classList.remove('is-panic', 'is-rage', 'is-flee', 'is-dead');
  if (hero.visualState === 'panic') wrap.classList.add('is-panic');
  if (hero.visualState === 'rage') wrap.classList.add('is-rage');
  if (hero.visualState === 'flee') wrap.classList.add('is-flee');
  if (hero.visualState === 'dead') wrap.classList.add('is-dead');

  var icon = document.getElementById('battle-card-icon');
  if (icon) icon.innerHTML = getHeroIcon(hero);

  syncHeroTokenVisual(hero);
}
