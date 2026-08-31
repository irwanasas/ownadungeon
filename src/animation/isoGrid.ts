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

// A deliberately non-square room grid: wider on Y than X so the Entrance
// corner (max X, max Y) reads toward the lower-LEFT of the diamond rather
// than dead-center-bottom, and the walk back to Exit (0,0) reads as
// moving up and to the right — matching the spec's "door at lower-left" /
// "progression toward upper-right" framing. Bumped from the original 3x4
// to 4x5 (12 -> 20 tiles) to make the raid room read as a genuinely
// bigger, more spacious dungeon space instead of a cramped strip — see
// app/styles/battle.css's room-chamber/room-floor sizing, which was
// expanded to match now that the raid log no longer reserves a
// competing chunk of vertical space.
export const GRID_W = 4; // tileX: 0..GRID_W-1
export const GRID_H = 5; // tileY: 0..GRID_H-1

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
//
// Derived from GRID_W/GRID_H (rather than hand-picked magic numbers) so
// the viewBox always exactly bounds the diamond for whatever grid size is
// configured above, with PAD_X/PAD_Y of breathing room on each edge for
// the door sprite and standee entities that extend past a tile's own
// footprint. See the corner-math in the isoGrid module comment above:
// with hw = TILE_WIDTH/2 and hh = TILE_HEIGHT/2, the diamond's leftmost/
// topmost point is at originX - GRID_H*hw / originY - hh, and its
// rightmost/bottommost point is at originX + GRID_W*hw / originY +
// (GRID_W+GRID_H-1)*hh — solving both edges for a symmetric PAD gives
// the formulas below.
const PAD_X = 24;
const PAD_Y = 16;
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
