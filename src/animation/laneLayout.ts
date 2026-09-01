// Simple left-to-right lane layout for the sidescrolling raid stage.
// Replaces the old isometric tile-coordinate system — see
// /backup/isometric/src/animation/isoGrid.ts for the previous version.
//
// Positions are plain percentages of the `.room-floor` box:
//   0%   = far left  (entrance)
//   100% = far right (exit)
// No background art is required to align to; `.room-floor` just fills a
// chunk of the room-chamber and these constants place things within it.

export const ENTRANCE_X = 8;   // hero's starting position, left edge
export const ENCOUNTER_X = 50; // where hero + monster meet and fight, center
export const EXIT_X = 92;      // hero's exit position / monster's entry position, right edge
export const FLOOR_Y = 78;     // fixed vertical "ground line" (% of room-floor height) both tokens stand on
