# Game assets

Next.js serves everything under `public/` from the site root, so a file at
`public/assets/traps/spike.png` is reachable at `/assets/traps/spike.png`
(or `/ownadungeon/assets/traps/spike.png` on the deployed GitHub Pages build).
A raw `/assets/...` string in TS/CSS does **not** get that `/ownadungeon`
prefix automatically — Next's `basePath` rewrite only applies to its own
routing, not to CSS `url()`/`background-image` or hardcoded strings, so any
new asset path referenced outside a React component needs the
`NEXT_PUBLIC_BASE_PATH` env var prefixed manually (see `app/assetVars.ts`
and `src/animation/monsterToken.ts` for the existing pattern).

## What's actually wired in

- **`monsters/`** — `goblin_troop`, `goblin_shaman`, `goblin_elite`, `orc`
  each have a real sprite sheet (`S_Idle.png` etc.), looked up by monster id
  in `src/data/monsterSprites.ts` and rendered as a static first-frame crop
  on the monster token (`src/animation/monsterToken.ts`) — no frame
  animation, no canvas. `slime` has no art yet and still renders as an
  emoji fallback.
- **`ui/cropped/`** — small, purpose-cropped icons actually used by the game
  (currency icons, nav icons, the Raid button, panel/button chrome), wired
  in via `app/assetVars.ts`'s CSS custom properties. New icons should be
  cropped the same way from the raw sheets below and dropped here.
- **`ui/*.png`** (the uncropped sheets — `Icons.png`, `Buttons.png`, etc.) —
  source material for the crops above, not referenced directly by the game.
  Pick a new icon from here, crop it, drop the crop in `ui/cropped/`.
- **`ui/bg/`** — the room chamber backdrop image.

## Not wired in yet

- **`traps/`**, **`heroes/`**, **`king/`** — empty (aside from `.gitkeep`).
  Traps and heroes currently render as emoji glyphs
  (`TrapDef.icon`/`HeroArchetype.icon` in `src/data/*.ts`); the King avatar
  in the HUD is also emoji. Drop a square, transparent-background icon
  (roughly 128×128–256×256px) named after the trap/hero `id` from
  `src/data/traps.ts`/`src/data/heroes.ts`, or `king.png` for the King, and
  ask for it to be wired in the same way the monster sprites were.

## What to tell me when it's ready

- Which files you added (or just say "check `public/assets/`" and I'll look).
- Anything that doesn't follow the id-based naming above.
- Any files intended for something not listed here (extra UI chrome, a new
  visual effect, etc.) — just describe what it's for.
