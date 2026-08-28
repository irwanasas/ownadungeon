// Generic lookup across the dungeon-item catalogs (traps, monsters, treasure).
import { TRAPS } from './traps.js';
import { MONSTERS, TREASURE } from './monsters.js';

export function catalogFor(catalogId, kind) {
  if (kind === 'trap') return TRAPS[catalogId];
  if (kind === 'monster') return MONSTERS[catalogId];
  if (kind === 'treasure') return TREASURE;
  return null;
}
