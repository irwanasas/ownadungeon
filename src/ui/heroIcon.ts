// Maps a hero's current visual/reaction state to the glyph shown for it
// (hero card icon, dungeon-runway token). Kept as its own leaf module so
// both ui/heroCard.js and animation/heroToken.js can use it without
// creating a dependency on the hero entity module itself.
import type { Hero } from '../types';

export function getHeroIcon(hero: Hero | null): string {
  if (!hero) return '⚔';
  if (hero.visualState === 'dead') return '💀';
  if (hero.visualState === 'flee') return '💨';
  if (hero.visualState === 'rage') return '🔥';
  if (hero.visualState === 'panic') return '😰';
  return hero.icon || '⚔';
}
