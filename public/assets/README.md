# Game assets

Drop art files here to replace the current CSS/SVG/emoji placeholders. Next.js
serves everything under `public/` from the site root, so a file at
`public/assets/traps/spike.png` is reachable at `/assets/traps/spike.png`
(or `/ownadungeon/assets/traps/spike.png` on the deployed GitHub Pages build,
handled automatically by `next.config.ts`'s `basePath`).

Nothing in here is wired into the game yet — dropping a file into a folder
does not change anything by itself. Once files are here, ask for them to be
implemented and they'll get wired into the matching `src/data/*.ts` catalog
entries and/or the isometric battlefield (`src/animation/isoGrid.ts`,
`app/styles/isometric.css`).

## Folders & expected filenames

Filenames should match the internal `id` used in `src/data/*.ts` so they can
be looked up directly — no separate mapping table needed. Extension can be
`.png`, `.webp`, or `.svg`.

| Folder | Expected files (id → filename) | Used for |
|---|---|---|
| `traps/` | `spike`, `poison`, `net`, `fire`, `frost` | Trap icon in Armory, dungeon slots, room-content marker on the iso floor |
| `monsters/` | `skeleton`, `goblin`, `ogre`, `slime`, `shade`, `treasure` | Monster/treasure icon, same spots as traps |
| `heroes/` | `warrior`, `rogue`, `berserker`, `mage`, `paladin` | Hero token on the battlefield, Enemy Detected panel, battle card |
| `king/` | e.g. `king.png` (one is enough — level is shown as text, not separate art per level) | Throne room content marker |
| `tiles/` | e.g. `floor.png` (one diamond tile texture) or `floor.png` + `floor-alt.png` for the checker pattern | Isometric floor grid tiles (currently flat-color SVG polygons) |
| `ui/` | door, buttons, panel chrome, whatever else | Misc UI chrome (already has a `.placeholder`) |

## Sizing guidance

- **Trap/monster/hero/king icons** — square, transparent background, roughly
  128×128–256×256px. They're currently rendered as single emoji glyphs, so
  a square icon is the easiest drop-in replacement.
- **Floor tiles** — should match the isometric diamond's aspect ratio used
  in `isoGrid.ts` (`TILE_WIDTH = 64`, `TILE_HEIGHT = 32`, i.e. 2:1), so a
  128×64px or 256×128px diamond-shaped (transparent corners) image lines up
  cleanly with the existing tile grid without stretching.
- Keep individual files reasonably small (this is a client-side, static-export
  game — everything ships to the browser on first load).

## What to tell me when it's ready

- Which files you added (or just say "check `public/assets/`" and I'll look).
- Anything that doesn't follow the id-based naming above.
- Any files intended for something not listed here (extra UI chrome, a new
  visual effect, etc.) — just describe what it's for.
