# Dungeon Forge

You are the dungeon owner. Place traps and monsters across a 6-room strip, press **Raid**, and watch an autonomous hero try to survive it.

- **Stack:** Next.js App Router (TypeScript), static export
- **Live:** https://irwanasas.github.io/ownadungeon/ (auto-deployed from `main` via GitHub Actions)
- **Persistence:** `localStorage`, client-side only

## How to play

1. Tap a room slot to open the build sheet and place a trap or monster (room 6, the Throne, is fixed).
2. Swipe the dungeon strip to preview the layout.
3. Press **Raid** and watch the hero fight through it.
4. Spend gold/souls in the upgrade sheet to level up traps, monsters, and the King.

## Structure

- `engine/` — pure simulation and data, no DOM or React. `simulateRaid()` runs a whole raid and returns an ordered event log.
- `app/forge/` — the mobile UI: the dungeon stage, build/upgrade/result sheets, a procedural WebAudio layer, and the raid-playback hook that turns the engine's event log into animation.
- `scripts/gen-forge-assets.py` — generates the pixel-art sprites in `public/forge/`.

## Dungeon

6 rooms total: 5 editable (trap, monster, or empty) plus a permanent Throne Room. The strip scrolls horizontally with native touch/swipe; the raid camera drives the same scroll position during a raid.

## Heroes, monsters, traps

3 heroes (Paladin/tank, Trickster/evasion, Elementalist/ramping caster), 3 monsters (Brute, Swarm, Shaman), 3 traps (Spike, Poison, Frost) — each with a distinct mechanic, designed to combo (e.g. Frost chills evasion, then Swarm's multiple hits exploit it). 6 handcrafted stages unlock new content; Arcade is an endless wave mode.

## Commands

```
npm run dev         # local dev server
npm run build       # static export to out/
npm run type-check  # tsc --noEmit
```
