import { TRAPS } from './traps';
import { MONSTERS, TREASURE } from './monsters';
import type { CatalogItem, ItemKind } from '../types';

export function catalogFor(catalogId: string, kind: ItemKind): CatalogItem | null {
  if (kind === 'trap') return TRAPS[catalogId];
  if (kind === 'monster') return MONSTERS[catalogId];
  if (kind === 'treasure') return TREASURE;
  return null;
}
