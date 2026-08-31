---
name: art-direction
description: >-
  Use when adding or reskinning visuals in Own a Dungeon — new sprite
  crops from the UI pack, color/palette choices, new overlay or panel
  styling, or checking visual consistency across the game's screens.
  Triggers on "reskin", "sprite", "color palette", "looks off", "visual
  consistency", "art style". Adapted from AlterLab-IEU/AlterLab_GameForge's
  game-art-director agent, trimmed to this project's actual (small,
  DOM/CSS-based) visual system.
license: MIT
---

# Own a Dungeon — Art Direction

Source: condensed from
[AlterLab-IEU/AlterLab_GameForge](https://github.com/AlterLab-IEU/AlterLab_GameForge)'s
`game-art-director` agent, written for teams shipping full concept-art
pipelines and style guides across many artists. This project has one visual
system (CSS + a small set of cropped sprites), so this version is a
checklist against that system rather than a studio process.

## The established visual system (match it, don't reinvent it)

- **Dark ember/bone/gold palette** defined as CSS custom properties in
  `app/styles/tokens.css` (`--bone`, `--ember`, `--ember-bright`, `--gold`,
  `--soul`, `--poison`, `--muted`, `--border`, etc.). New UI should pull
  from these tokens, not introduce new hex literals — check `tokens.css`
  first for anything that looks like it should already have a name.
- **Pixel-art sprite pack**, hand-cropped into
  `public/assets/ui/cropped/` from the uploaded UI-kit sheets in
  `public/assets/ui/` (see git history: `panel-parchment.png`,
  `pill-button.png` / `-hover`, `icon-gold.png`, `icon-soul.png`). Most of
  the original sheets (Levels, Craft, Equipment, Shop, Inventory,
  Win/Loose, digit fonts) don't map to this game's screens and are
  intentionally unused — check there before assuming a new icon needs a
  fresh crop.
- **9-slice pixel buttons, parchment panels for overlays** — the Settings
  overlay reskin (`#settings-overlay .side-panel` in `components.css`)
  is the reference pattern for "reskin one overlay instance without
  affecting the other three that share `.side-panel`": scope new skins
  with an id selector, never restyle the shared base class directly.
- **`image-rendering: pixelated`** on every pixel-art sprite reference —
  omitting it is the most common way a new crop looks visually
  inconsistent with the rest of the game (soft/blurred vs. crisp).
- **Isometric battlefield** (`app/styles/isometric.css` +
  `src/animation/isoGrid.ts`) is the newest visual layer — floor tiles,
  door, hero token — and currently uses flat CSS shapes/gradients rather
  than sprite art. Any new battlefield visual should either match that
  flat-shape language or, if introducing sprite art there, say so
  explicitly since it'd be a style shift from the rest of that surface.

## Consistency check before shipping a visual change

1. **Does it reuse a token from `tokens.css`**, or does it need a new one
   (and if so, does the new token fit the existing bone/ember/gold/soul
   naming, not an arbitrary name)?
2. **Does it reuse an existing cropped sprite**, or does a new crop need
   pixel-level bounding-box work (see `browser-game-dev`'s note on the
   PIL/scipy connected-component cropping approach used for the last
   sprite pass — precise crops beat eyeballing thumbnails)?
3. **Is it scoped correctly** — a global class change affects every
   overlay/screen that shares it; an id-scoped override affects one. Pick
   deliberately, the way `#settings-overlay .side-panel` does.
4. **Does it hold up at the ~420px mobile viewport** this game targets?
   Desktop-only visual review has missed real issues before (see the
   `.side-panel` full-bleed-at-mobile-width behavior).
5. **Redundant affordances** — the Settings panel crop had a baked-in "X"
   icon that duplicated the real interactive close button and had to be
   painted over. Check any new panel/button crop for baked-in UI that
   would visually double up with a real DOM element sitting on top of it.

## Not applicable here

Concept art pipelines, multi-artist style guides, 3D asset specs, motion
capture, cinematic lighting — this project's whole visual surface is CSS +
a handful of cropped 2D sprites; keep additions proportionate to that.
