---
name: 2d-web-game-craft
description: >-
  Use when working on sprite/animation presentation, the isometric
  battlefield, or browser-runtime concerns (asset loading, tab visibility,
  performance of the render loop) in Own a Dungeon. Triggers on "sprite",
  "animation", "isometric", "hero movement", "asset loading", "frame rate",
  "juice". Adapted from davila7/claude-code-templates' web-games and
  2d-games skills — trimmed to what applies to a DOM/CSS-rendered game
  (this project has no canvas, no physics engine, no tilemap engine).
license: MIT
---

# 2D Web Game Craft — DOM/CSS Edition

Source: condensed from
[davila7/claude-code-templates](https://github.com/davila7/claude-code-templates)'
`creative-design/game-development/web-games` and `.../2d-games` skills.
Those assume a canvas engine (Phaser/PixiJS), WebGPU, tilemap/atlas systems,
and a physics engine — none of which exist or are wanted in this project.
Own a Dungeon renders everything as styled DOM elements positioned on a CSS
isometric grid (`src/animation/isoGrid.ts`), so this version keeps only the
parts of those two skills that transfer: sprite/animation feel principles,
top-down movement patterns, and real browser-runtime constraints.

## Sprite & animation feel

Applies to anything using the cropped sprites in `public/assets/ui/cropped/`
or the hero/monster tokens in the battlefield:

- **Timing reads as intent.** `src/animation/beatTiming.ts` (`beatMs()`) is
  the single source of truth for pacing raid beats — reuse it rather than
  hardcoding new `setTimeout` delays elsewhere.
- **Anticipation → action → follow-through**, even in CSS transitions. A
  hero step, a hit reaction, a door opening should each have a distinct
  start/impact/settle rather than one linear tween — see how
  `src/animation/heroToken.ts` and `.room-door` transitions in
  `isometric.css` already stage movement.
- **`image-rendering: pixelated`** on every pixel-art sprite reference
  (already the convention in `layout.css`/`components.css` for the cropped
  UI-pack sprites) — never let the browser smooth pixel art.
- **9-slice (`border-image`) over stretching** for any new pixel-art button
  or panel sprite that must resize — see `.btn` in `layout.css` for the
  established pattern (`border-image-slice` + `border-image-repeat:
  stretch`), rather than a plain `background-size: 100% 100%` which
  distorts corners.

## Top-down movement (applies directly — this is a top-down isometric game)

- Own a Dungeon's hero token moves tile-to-tile on a discrete grid
  (`isoGrid.ts` + `roomStage.ts`), not free-form physics movement — keep new
  movement additions (a monster token, a projectile) on that same
  coordinate system rather than inventing a second one.
- Favor **readable** motion over "realistic" motion: a beat-paced step from
  tile to tile that the player can follow beats free interpolation that
  looks smooth but obscures what's happening — consistent with this being a
  turn-resolved combat game, not an action game.

## Browser-runtime constraints that still apply (no canvas needed to hit these)

- **Tab visibility.** `src/core/offlineProgress.ts` already treats
  time-away as a first-class case (offline progress on return). Any new
  timer-driven system (a raid animation, an idle tick) should be resilient
  to the tab being backgrounded mid-sequence, not just assume it keeps
  running at real-time cadence.
- **Asset loading.** The UI-pack sprites are small cropped PNGs served from
  `public/assets/ui/cropped/`, referenced via the `--img-*` CSS custom
  properties (see `browser-game-dev` skill for why). Keep new sprite crops
  small and purpose-cropped rather than shipping full multi-icon sheets to
  the client — this project has no lazy-loading/streaming infrastructure,
  so everything referenced ships in the initial static export.
- **Mobile input.** This is a touch-first, single-screen mobile layout
  (`~420px` viewport target). Any new interactive element needs a real tap
  target size and must be checked at that viewport, not just desktop mouse
  hover states.
- **Audio (if ever added).** This project currently ships no audio. If
  audio is added, note for whoever implements it: browsers require a user
  gesture before `AudioContext` can play — wire it to an existing tap
  (e.g. Raid button), don't try to autoplay on load.

## Explicitly not applicable here — don't reach for these

Sprite atlases/draw-call batching, WebGPU/WebGL feature detection, a
physics engine, tilemap auto-tiling, screen-shake via camera transforms
(there is no camera — the board is fixed), service-worker/PWA offline
install. If a request seems to need one of these, it likely means the
request wants a bigger architectural change than "add a 2D game feature" —
flag that explicitly rather than quietly bolting on a canvas layer.
