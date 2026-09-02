import type { Hero } from '../types';

export function getHeroIcon(hero: Hero | null): string {
  if (!hero) return '⚔';
  if (hero.visualState === 'dead') return '💀';
  if (hero.visualState === 'flee') return '💨';
  if (hero.visualState === 'rage') return '🔥';
  if (hero.visualState === 'panic') return '😰';
  return hero.icon || '⚔';
}
