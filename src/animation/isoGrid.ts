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

// A small, deliberately non-square room grid: wider on Y than X so the
// Entrance corner (max X, max Y) reads toward the lower-LEFT of the
// diamond rather than dead-center-bottom, and the walk back to Exit (0,0)
// reads as moving up and to the right — matching the spec's "door at
// lower-left" / "progression toward upper-right" framing.
export const GRID_W = 3; // tileX: 0..GRID_W-1
export const GRID_H = 4; // tileY: 0..GRID_H-1

export interface Tile {
  x: number;
  y: number;
  z?: number;
}

export const ENTRANCE_TILE: Tile = { x: GRID_W - 1, y: GRID_H - 1, z: 0 };
export const EXIT_TILE: Tile = { x: 0, y: 0, z: 0 };
export const ENCOUNTER_TILE: Tile = { x: 1, y: Math.floor(GRID_H / 2), z: 0 };

// Logical viewBox the floor grid is drawn in; toScreenCoords() and the SVG
// floor both work in this space, so the isometric room scales cleanly to
// any on-screen chamber size via the SVG's own viewBox scaling — no need
// to measure real pixel dimensions in JS.
export const VIEW_W = 300;
export const VIEW_H = 150;
export const ORIGIN_X = 150;
export const ORIGIN_Y = 18;

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

// Simple isometric depth key: tiles/entities further down-screen (higher
// x+y) draw on top of ones further up-screen. Good enough for the MVP —
// no overlapping-entity occlusion logic needed with one hero + static
// floor + one encounter marker.
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

// Waypoints (inclusive of both ends) for a tile-by-tile walk from `a` to
// `b` in `steps` hops. Sub-tile interpolation is fine visually — it still
// reads as discrete stepping once each waypoint gets its own CSS
// transition leg.
export function tilePath(a: Tile, b: Tile, steps: number): Tile[] {
  var pts: Tile[] = [];
  for (var i = 0; i <= steps; i++) {
    pts.push(lerpTile(a, b, i / steps));
  }
  return pts;
}
