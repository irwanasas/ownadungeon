---
name: perf-profile
description: >-
  Use when investigating performance in Own a Dungeon — jank during raid
  animations, slow initial load, or general "is this going to be slow"
  questions before adding a system. Triggers on "performance", "slow",
  "janky", "frame rate", "profile this". Adapted from
  Donchitos/Claude-Code-Game-Studios' perf-profile skill, retargeted from
  engine Update()/Tick()/draw-call analysis to this game's actual
  DOM/CSS/requestAnimationFrame-free rendering model.
license: MIT
---

# Own a Dungeon — Performance Profiling

Source: condensed from
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)'
`perf-profile` skill. The original targets a game engine's per-frame
`Update()`/`Tick()` cost, draw calls, and shader complexity — none of which
apply here. Own a Dungeon has no per-frame render loop at all: it's
DOM/CSS driven by discrete state changes and `setTimeout`-paced beats
(`src/animation/beatTiming.ts`), so the actual performance surface is
different. This version targets that real surface. For architectural
questions about *where* code should live, see `tech-architecture` — this
skill is measurement only.

## What can actually be slow in this project

**Initial load / static export size:**
- Bundle size of `app/` + `src/` (check `npm run build` output for page
  size).
- Sprite asset weight in `public/assets/ui/cropped/` and any unused
  originals still under `public/assets/ui/` — everything referenced ships
  in the static export with no lazy-loading (see `2d-web-game-craft`
  skill's note on this).

**DOM update cost during a raid:**
- `src/ui/*.ts` modules do direct DOM manipulation keyed by element id via
  `renderBus.ts`. The failure mode here isn't "too many draw calls," it's
  redundant full-panel re-renders on every small state change instead of
  targeted updates — check whether a change re-queries/rebuilds a whole
  list (`dungeonSlots.ts`, `raidLog.ts`, `statsPanel.ts`) when only one
  row actually changed.
- CSS transitions/animations on many simultaneous elements (e.g. every
  dungeon slot animating at once) can jank on low-end mobile — this is a
  touch-first mobile game, so test perf claims against a throttled/mobile
  profile, not just a fast desktop dev machine.

**Timer-driven pacing:**
- `beatTiming.ts` paces raid beats via `setTimeout`. A slow beat handler
  (heavy synchronous work inside a beat callback) delays the *next* beat
  too, since nothing here runs off a fixed frame clock — profile the beat
  handlers themselves, not an imaginary frame budget.

**Persistence:**
- `localStorage` read/write on every state change — if a new system writes
  state very frequently (e.g. every animation tick rather than per beat or
  per raid), that's a realistic bottleneck specific to this project's
  persistence model.

## How to actually check it

1. **Build size**: `npm run build` and read the reported route/page sizes.
2. **Runtime**: serve `out/` and use Chrome DevTools Performance panel (or
   Playwright's tracing) during an actual raid — look for long tasks and
   excessive DOM mutation, not FPS-counter numbers (there's no game loop
   to measure FPS against).
3. **Mobile-realistic conditions**: throttle CPU in DevTools (4x–6x
   slowdown) before judging "is this fine" — this project targets mobile
   devices, and a desktop-fast profile can hide real jank.

## Report format

```
## Performance check: [what was profiled]

Findings:
- [location/file] — [what's expensive] — [rough impact]

Recommendation:
- [specific fix, e.g. "diff-update the changed dungeon slot instead of
  rebuilding #dungeon-slots on every render"]

Confirmed via: [build output / DevTools trace / throttled mobile profile]
```

Never optimize from a hunch — this skill is about measuring first. If a
suspicion can't be confirmed with the build output or a real trace, say
that plainly rather than presenting a guess as a finding.
