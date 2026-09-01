// Centralized logical-tile <-> screen-space conversion for the isometric
// raid battlefield. Nothing here touches the DOM or combat state — pure
// coordinate math, reused by roomStage.ts (floor/door/content placement)
// and heroToken.ts (hero movement) so there's exactly one projection
// formula in the whole codebase.
//
// Orientation (per spec): (0, 0) is the far/top corner = Exit. +X moves
// diagonally down-right, +Y moves diagonally down-left. The near/bottom
// corner (max X, max Y) is the Entrance.
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// Entrance (max X, max Y) reads lower-left; Exit (0,0) upper area.
// GRID is 4x4 to match the white floor grid painted in
// public/assets/ui/bg/IMG_4394.jpeg — entities walk on that art, not a
// second synthetic tile layer.
export const GRID_W = 4;
export const GRID_H = 4;

export interface Tile {
  x: number;
  y: number;
  z?: number;
}

export const ENTRANCE_TILE: Tile = { x: GRID_W - 1, y: GRID_H - 1, z: 0 };
export const EXIT_TILE: Tile = { x: 0, y: 0, z: 0 };
export const ENCOUNTER_TILE: Tile = { x: 1, y: Math.floor(GRID_H / 2), z: 0 };

// PAD 0 so VIEW tightly matches the painted diamond (no empty margin that
// would offset tokens relative to the art grid).
const PAD_X = 0;
const PAD_Y = 0;
const HW = TILE_WIDTH / 2;
const HH = TILE_HEIGHT / 2;
export const ORIGIN_X = PAD_X + GRID_H * HW;
export const ORIGIN_Y = PAD_Y + HH;
export const VIEW_W = 2 * PAD_X + (GRID_W + GRID_H) * HW;
export const VIEW_H = 2 * PAD_Y + (GRID_W + GRID_H) * HH;

export interface ScreenPoint {
  x: number;
  y: number;
}

export function toScreenCoords(
  tileX: number,
  tileY: number,
  tileZ = 0,
  originX: number = ORIGIN_X,
  originY: number = ORIGIN_Y
): ScreenPoint {
  return {
    x: originX + (tileX - tileY) * (TILE_WIDTH / 2),
    y: originY + (tileX + tileY) * (TILE_HEIGHT / 2) - tileZ
  };
}

export function depthKey(tileX: number, tileY: number): number {
  return tileX + tileY;
}

export function lerpTile(a: Tile, b: Tile, t: number): Tile {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: (a.z || 0) + ((b.z || 0) - (a.z || 0)) * t
  };
}

export function tilePath(a: Tile, b: Tile, steps: number): Tile[] {
  var pts: Tile[] = [];
  for (var i = 0; i <= steps; i++) {
    pts.push(lerpTile(a, b, i / steps));
  }
  return pts;
}
