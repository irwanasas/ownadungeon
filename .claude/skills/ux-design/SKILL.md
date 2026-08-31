---
name: ux-design
description: >-
  Use when changing player-facing flow, onboarding, HUD legibility, or
  accessibility in Own a Dungeon — new overlays, new buttons/nav items,
  touch-target sizing, or anything about whether a screen is clear on a
  small mobile viewport. Triggers on "onboarding", "UX", "accessibility",
  "confusing", "hard to tell", "mobile layout". Adapted from
  AlterLab-IEU/AlterLab_GameForge's game-ux-designer agent, trimmed to this
  project's single-screen mobile-first UI.
license: MIT
---

# Own a Dungeon — UX

Source: condensed from
[AlterLab-IEU/AlterLab_GameForge](https://github.com/AlterLab-IEU/AlterLab_GameForge)'s
`game-ux-designer` agent, written for teams with dedicated UX research and
multi-platform flow diagrams. This project is one mobile-first screen with
four slide-in overlays — this version is a direct checklist against that
actual layout, not a research process.

## The layout, as it actually is

- **Single screen, no main scroll** (`app.layout`), mobile-first at
  `~420x860`. Bottom nav (`bottom-nav`) opens four overlays: Armory
  (palette, left), Upgrades (right), Stats (right), Settings (right) — all
  `.side-overlay` / `.side-panel` instances. A new major feature should
  fit into this pattern (a fifth overlay, or content within an existing
  one) rather than introducing a new screen/route — this app has no
  routing.
- **`#room-preview` is the one panel that changes meaning mid-session**:
  pre-raid it's "Enemy Detected" (upcoming hero + matchup hint), during
  combat it becomes a compact battle card (HP bar + contextual reaction
  text). Any change here must keep both states legible — don't optimize
  one state's layout in a way that breaks the other.
- **`play-fab`** (the floating Raid button) is the one primary action
  always visible outside overlays — treat it as the "what do I do next"
  anchor; don't add a second competing primary CTA to the main screen.
- **Settings → Danger Zone** is where the one truly destructive action
  (Reset Game) lives, behind a confirm modal (`#reset-modal`). Any new
  destructive action follows that pattern: tucked in Settings, confirmed
  via modal, never a single-tap action on the main screen.

## Legibility checklist for any new UI

1. **Can the player tell what happened without reading a wiki?** The
   battle-card reaction text and matchup hint exist specifically so combat
   outcomes are explainable from the UI alone — a new mechanic needs the
   same treatment, not just a number changing.
2. **Touch targets.** This is touch-first; check real tap-target size at
   the mobile viewport, not just that it "looks clickable" on desktop with
   a mouse.
3. **Color alone never carries meaning.** Currency icons pair color with a
   distinct icon shape (`gold-icon`/`soul-icon`); status/HP states should
   follow the same pairing, not rely on a color shift alone (colorblind
   readability).
4. **New overlay content follows the existing header pattern**:
   `.side-panel-header` with a title + optional hint text + `.overlay-close`
   in the same corner — don't invent a new close-affordance placement per
   overlay.
5. **Onboarding is currently minimal** — the "Enemy Detected" pre-raid
   panel is the game's main just-in-time teaching moment (shows the
   matchup before commitment). If adding a new mechanic that isn't
   self-evident from the UI, consider whether it needs its own just-in-time
   hint rather than relying on the player experimenting blind.

## When reviewing an existing change for UX issues

Walk the actual flow — Enemy Detected → Armory placement → Raid → room-by-
room resolve → Throne — and check each step still reads clearly with the
change applied, at the mobile viewport. Flag anything that only makes
sense if the player already knows the mechanic, not anything discoverable
in-context.
