---
name: tech-architecture
description: >-
  Use when making a structural decision in Own a Dungeon — where new logic
  should live (src/data vs src/combat vs src/ui), whether to add a
  dependency, how to keep the Next.js static-export/GitHub-Pages
  constraints intact, or any change touching next.config.ts, the
  basePath/assetPrefix setup, or TypeScript config. Triggers on
  "architecture", "should this go in", "add a dependency", "static export",
  "build config". Adapted from AlterLab-IEU/AlterLab_GameForge's
  game-technical-director agent, trimmed to this project's real stack.
license: MIT
---

# Own a Dungeon — Technical Architecture

Source: condensed from
[AlterLab-IEU/AlterLab_GameForge](https://github.com/AlterLab-IEU/AlterLab_GameForge)'s
`game-technical-director` agent, which is written for engine selection
(Unity/Unreal/Godot) and large-team architecture review boards (ADRs,
architecture-decision records, a dedicated `technical-director` subagent).
This project is a single-maintainer static web app with an already-settled
stack — the useful part of that agent is the discipline of thinking through
constraints before adding structure, not the process around it. Performance
*measurement* is covered by the separate `perf-profile` skill — this skill
is about where things live and what the platform allows, not about
profiling.

## The stack, as it actually is (don't relitigate this without cause)

- **Next.js App Router, static export** (`output: 'export'` in
  `next.config.ts`) — deploys to GitHub Pages under a `basePath`/
  `assetPrefix` of `/ownadungeon/`. There is no server at runtime. Any
  suggestion that assumes an API route, SSR data fetching, or a database
  is off the table unless the user explicitly wants to change the
  deployment model — ask first, don't quietly introduce one.
- **TypeScript throughout**, `src/` framework-free (no React inside game
  logic), React only for the static shell in `app/`. This split is
  deliberate (see `browser-game-dev` skill) — don't propose moving game
  state into React state/context as a "modernization"; it would require
  rearchitecting rendering with no stated benefit to this game's needs.
- **Zero runtime dependencies beyond `next`/`react`/`react-dom`**
  (`package.json`). Before adding any library (an animation lib, a state
  manager, a UI kit), check whether the ~200 lines it would replace are
  already handled adequately by hand — this project has consistently
  chosen vanilla implementations (see `beatTiming.ts`, `isoGrid.ts`) over
  pulling in a game framework, and that's a stated architectural choice,
  not an oversight.
- **`localStorage`-only persistence.** No backend, no accounts, no
  multiplayer. Don't design a feature that requires server-side state
  (leaderboards with anti-cheat, cross-device sync) without flagging that
  it needs a real infrastructure decision first.
- **CSS custom properties for basePath-safe asset URLs** — plain CSS
  `url()` isn't rewritten by Next's basePath handling, so cropped sprite
  paths are injected via `--img-*` vars set from `NEXT_PUBLIC_BASE_PATH`
  in `GameApp.tsx`. Any new static asset referenced from CSS must follow
  this pattern, not a hardcoded `/assets/...` path (which breaks under the
  GitHub Pages basePath).

## Where new code goes

| Kind of change | Location |
|---|---|
| New tunable content (trap, monster, hero, stage, upgrade) | `src/data/*.ts` |
| New matchup/combat rule | `src/combat/*.ts` (+ `src/data/matchups.ts` if it's a data-driven rule) |
| New persisted or runtime-only state field | `src/state/gameState.ts` or `runtimeState.ts` |
| New DOM rendering for an existing element id | `src/ui/*.ts` |
| New element id / overlay markup | `app/GameApp.tsx` |
| New visual style | the matching `app/styles/*.css` file by concern, not a new catch-all file |
| New animation timing | reuse `src/animation/beatTiming.ts`, don't hardcode a second timing system |

## Before adding structure, ask

1. **Does this fit an existing layer, or does it need a new one?** This
   project's layering (data → combat/economy → state → ui) is intentionally
   thin. A new top-level directory should be rare and justified by a real
   cross-cutting concern, not convenience.
2. **Does it survive a static export?** No dynamic server routes, no
   Node-only APIs at runtime, no assumption of a writable filesystem.
3. **Does it respect the basePath?** Any new asset URL or fetch path needs
   to work under `/ownadungeon/` in production and `/` in dev — check
   `next.config.ts`'s `NEXT_PUBLIC_BASE_PATH` pattern rather than
   hardcoding.
4. **Is a new dependency actually earning its weight?** Given the
   zero-runtime-dependency baseline, prefer extending existing hand-rolled
   code unless the dependency removes real, nontrivial complexity.

If a request genuinely can't fit this architecture (e.g. real multiplayer,
server-authoritative economy), say that plainly and ask how the user wants
to proceed rather than forcing it into the current static-export shape.
