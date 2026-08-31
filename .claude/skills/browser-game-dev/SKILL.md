---
name: browser-game-dev
description: >-
  Use when adding a new gameplay system, screen, or mechanic to Own a
  Dungeon (Next.js/React/TS DOM-based dungeon RPG) — e.g. "add a new trap
  type", "build an arcade leaderboard", "add a new hero class". Enforces a
  one-system-at-a-time build-and-verify loop instead of building several
  systems in parallel untested. Adapted from Sudhanshu5669/Html5-Gamedev-Skill
  for this project's existing DOM/CSS architecture (no canvas engine).
license: MIT
---

# Own a Dungeon — Build & Verify Loop

Source: adapted from the `game-dev` skill in
[Sudhanshu5669/Html5-Gamedev-Skill](https://github.com/Sudhanshu5669/Html5-Gamedev-Skill).
That skill assumes a fresh canvas/WebGL project scaffolded with Phaser/PixiJS.
This project is **not** that: it's an established, shipping Next.js App
Router game that renders entirely with DOM + CSS (isometric floor via
`src/animation/isoGrid.ts`, no `<canvas>` anywhere). This version drops the
greenfield scaffolding phases and keeps only the discipline that still
applies to an existing project: one system at a time, verified in a real
browser before moving on.

## This project's shape (read before making changes)

- **Game logic** lives in `src/`, framework-free TypeScript: `data/` (traps,
  monsters, catalog, stages, matchups, upgrades — the tunable content),
  `state/` (persisted + runtime state), `economy/`, `combat/`
  (raid resolution, difficulty), `animation/` (isometric grid + hero token
  movement), `core/` (reset, offline progress), `ui/` (imperative DOM
  updates keyed by element id, driven by `renderBus.ts`).
- **React only mounts the shell.** `app/GameApp.tsx` is a static JSX shell
  (buttons, overlays, HUD markup with fixed element ids); `game-client.ts`
  boots the vanilla-JS game loop into that shell on the client. New UI
  elements go in `GameApp.tsx` with an id, then `src/ui/*.ts` queries and
  updates that id — this project does not use React state/props for
  gameplay UI.
- **Styling** is plain CSS in `app/styles/*.css`, split by concern
  (`layout.css`, `components.css`, `battle.css`, `isometric.css`,
  `tokens.css` for CSS custom properties). Sprite assets referenced from
  CSS go through the `--img-*` custom properties wired in `GameApp.tsx`
  (`assetUrl()`), because Next's GitHub Pages `basePath` isn't rewritten
  inside plain CSS `url()`.
- **Static export, no server.** `next.config.ts` builds with
  `output: 'export'` for GitHub Pages; all persistence is `localStorage`.
  Never add code that assumes a Node server or API route at runtime.

## The loop

1. **Scope one system.** A "system" here is one cohesive change: a new trap
   type end-to-end (data + matchup + UI icon), a new overlay, a new combat
   rule — not "the whole feature" if it spans unrelated concerns. If the
   user's ask is genuinely multiple systems, say so and propose an order;
   don't silently parallelize.
2. **Locate the right layer before writing code.** Content/tuning changes
   go in `src/data/*.ts`. New combat behavior goes in `src/combat/*.ts`.
   New visuals go in `app/styles/*.css` + the relevant `src/ui/*.ts`
   renderer. Don't duplicate logic across layers.
3. **Implement the one system.**
4. **Verify before moving on — every time, no exceptions:**
   - `npm run type-check`
   - `npm run build`
   - A real browser pass: build the static export (`npm run build`), serve
     `out/` locally, and drive the actual feature with Playwright
     (`/opt/pw-browsers/chromium`, headless) or ask the user to check it in
     dev (`npm run dev`). Screenshot the new/changed UI at the mobile
     viewport this game targets (`~420x860`) — this is a mobile-first
     single-screen game, and desktop-only checks miss real bugs (see the
     `#settings-overlay` full-bleed-at-mobile-width behavior as a past
     example of something that only showed up at that viewport).
   - Read the browser console for errors during the pass — a silent
     `pageerror` or thrown exception is a fail even if the screenshot looks
     fine.
5. **Fix-and-retest the same system on failure.** Don't start the next
   system carrying a known-broken one.
6. **Commit the verified system on its own** before starting the next one —
   this project's convention is one focused commit per change, not batched
   unrelated work.

## Don't

- Don't introduce a canvas/WebGL rendering path, a physics engine, or a
  bundler switch (Vite, Phaser, PixiJS) — this project is deliberately
  DOM/CSS-rendered and framework-agnostic in `src/`. If a request seems to
  need one of those, flag it and ask rather than quietly adding a new
  rendering stack.
- Don't skip the mobile-viewport check because desktop "looked right."
- Don't mark something done from reading the diff alone — this project's
  established habit (see recent isometric-battlefield and UI-reskin work)
  is to actually run `type-check` + `build` + a Playwright pass before
  calling anything finished.
