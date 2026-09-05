import type { DungeonSlot } from '../../engine/save';

export interface CellGeom {
  index: number;
  kind: 'entrance' | 'room' | 'throne';
  content: DungeonSlot | null;
  width: number;
  left: number;
  center: number;
}

const ROOM_W = 128;
const CAP_W = 96;

export function buildCells(rooms: DungeonSlot[]): CellGeom[] {
  const cells: CellGeom[] = [];
  let cursor = 0;

  cells.push({ index: -1, kind: 'entrance', content: null, width: CAP_W, left: cursor, center: cursor + CAP_W / 2 });
  cursor += CAP_W;

  rooms.forEach((room, i) => {
    cells.push({ index: i, kind: 'room', content: room, width: ROOM_W, left: cursor, center: cursor + ROOM_W / 2 });
    cursor += ROOM_W;
  });

  cells.push({ index: rooms.length, kind: 'throne', content: null, width: CAP_W, left: cursor, center: cursor + CAP_W / 2 });
  cursor += CAP_W;

  return cells;
}
