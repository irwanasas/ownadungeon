export const ENTRANCE_X = 34;  // hero's local step-in position, just left of center
export const ENCOUNTER_X = 50; // where hero + monster meet and fight, center
export const EXIT_X = 66;      // hero's local step-out position, just right of center
export const FLOOR_Y = 78;     // fixed vertical "ground line" (% of room-floor height) both tokens stand on

// The hero stays roughly centered on screen (small local nudges above); the
// scrolling corridor background (worldScroll.ts) is what actually carries
// the "walked another room" distance, so raids of any length stay seamless.
