---
name: qa-verification
description: >-
  Use before calling any code change in Own a Dungeon "done" — codifies
  the type-check + build + real-browser verification pass this project
  already relies on. Triggers on "is this done", "verify", "test this",
  "did it work", or automatically before wrapping up a code change.
  Adapted from AlterLab-IEU/AlterLab_GameForge's game-qa-lead agent,
  trimmed from a formal test-plan/acceptance-criteria process to this
  project's actual lightweight verification habit.
license: MIT
---

# Own a Dungeon — Verification Pass

Source: condensed from
[AlterLab-IEU/AlterLab_GameForge](https://github.com/AlterLab-IEU/AlterLab_GameForge)'s
`game-qa-lead` agent, written for formal test plans, acceptance-criteria
sign-off, and a dedicated QA subagent. This project has no test suite and
one maintainer, but it does already have a real, repeatedly-used
verification habit (see the isometric-battlefield and UI-reskin work) —
this skill writes that habit down so it's followed consistently instead of
depending on memory.

## The standing bar for "done"

Every code change to `src/`, `app/`, or `public/assets/` clears all of
these before being called finished — this is not optional per-change,
it's the project's baseline:

1. **`npm run type-check`** — zero errors. This project is strict
   TypeScript throughout `src/`; a type error here is a real bug, not
   noise.
2. **`npm run build`** — the static export must succeed. This is also
   the only way to catch basePath/asset-path issues (see
   `tech-architecture` skill) since `next dev` doesn't apply the GitHub
   Pages `basePath`.
3. **A real browser pass**, not just "the code looks right":
   - Serve the built `out/` directory locally (e.g.
     `python3 -m http.server` from `out/`) or use `npm run dev` for
     faster iteration on logic-only changes.
   - Drive the actual changed feature — click the real buttons, open the
     real overlay, trigger the real raid — via Playwright
     (`/opt/pw-browsers/chromium`, headless) or manual check.
   - Check the browser console for `pageerror`/`console.error` during the
     pass. A clean screenshot with a silent thrown exception underneath
     is still a fail.
   - Screenshot at the mobile viewport this game targets
     (`~420x860`) in addition to desktop, if the change touches layout —
     this project has caught real mobile-only bugs this way before (the
     `.side-panel` full-bleed-at-mobile-width case).

## Scoping the pass to the change

Don't re-verify the entire game on every change — verify the golden path
through the feature that changed, plus anything it visibly touches:

- **Data/balance change** (`src/data/*.ts`) → play through a raid that
  exercises the changed matchup/stage/upgrade, check the numbers land as
  intended in the UI (HP bars, gold/soul totals, upgrade costs).
- **New UI element** → open it, check both light interaction (hover/tap
  states) and the close/dismiss path, at both viewports.
- **Animation/timing change** (`beatTiming.ts`, `heroToken.ts`,
  `roomStage.ts`) → watch a full raid sequence end-to-end, not just the
  single beat that changed — timing bugs often only show up in the
  handoff between beats.
- **CSS-only visual change** → screenshot before/after comparison at both
  viewports; check it didn't leak into other screens sharing the same
  class (see `art-direction` skill's note on scoping overlay skins).

## What "acceptance criteria" means here

This project doesn't maintain a formal test-plan document. Instead, before
starting a change, state in one sentence what "working" looks like for it
(e.g. "the new trap reduces monster ATK by 20% and shows in the matchup
hint") — that sentence is the acceptance criterion, and the verification
pass above checks against it. If you can't state that sentence, the change
isn't scoped enough to start yet.

## Reporting

After the pass, say plainly what was checked and at what viewport(s) —
don't just say "verified," name the specific commands run and what was
visually confirmed. If something couldn't be checked (e.g. no way to
trigger a rare state), say so explicitly rather than implying full
coverage.
