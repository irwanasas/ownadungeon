import type { Hero } from '../types';
import { entityIconHtml } from './entityIcon';

export function getHeroIcon(hero: Hero | null): string {
  if (!hero) return '';
  return entityIconHtml(hero.icon);
}
