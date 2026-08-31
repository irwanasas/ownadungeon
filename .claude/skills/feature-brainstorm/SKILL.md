---
name: feature-brainstorm
description: >-
  Use when the user wants to explore ideas for new content or features in
  Own a Dungeon without a settled direction yet — "what could we add",
  "ideas for a new trap", "what should the next stage arc be". Triggers on
  "brainstorm", "ideas for", "what should we add", "not sure what to build
  next". Adapted from Donchitos/Claude-Code-Game-Studios' brainstorm
  skill — the original is a from-zero "invent a new game" ideation process
  (game concept, pillars, market fit); this version repurposes its
  facilitation techniques for ideating new content/features within an
  already-shipped game.
license: MIT
---

# Own a Dungeon — Feature & Content Brainstorm

Source: condensed from
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)'
`brainstorm` skill. The original walks a designer from zero to a full new
game concept (elevator pitch, genre mashups, market positioning) and writes
`design/gdd/game-concept.md`. Own a Dungeon already has a settled concept
(idle dungeon management, Hero × Monster × Trap puzzle, Stage/Arcade split
— see `README.md`) — this version keeps the facilitation discipline
(withhold judgment, build on ideas, use constraints as fuel) but points it
at "what's the next thing to add to this game" instead of "what game should
we build."

## Facilitation principles (kept from the original — still correct)

- Withhold judgment during exploration — generate before filtering.
- "Yes, and" over "but" — build on a half-formed idea rather than shutting
  it down early.
- Use this game's real constraints as creative fuel, not as blockers: no
  server/backend, `localStorage`-only, single mobile screen with four
  overlays, 5 hero classes × 5 monster types × 5 traps as the current
  puzzle scope, no audio yet. A good idea for this game works *within*
  those, or explicitly proposes changing one and says so.
- Ask what emotional/mechanical gap the idea fills — don't generate ideas
  in a vacuum. Anchor to: does this add a new *decision* to the Hero ×
  Monster × Trap puzzle, or is it a new economy sink, a new progression
  hook, or a new session-return reason?

## A useful ideation technique from the original, kept

**Mashup method** — combine an existing system with a new angle and see
if the tension produces a hook. Examples scoped to this game: "matchup
puzzle + a limited-uses consumable trap" (scarcity forces harder
placement decisions), "Arcade wave scaling + a temporary hero-only
buff-of-the-run" (roguelike-lite twist without touching Stage), "King
duel + a phase change partway through" (boss fight gets a second puzzle
layer). Generate 2–3 concrete directions this way rather than one vague
"more content" answer.

## Process

1. **Ask what gap this is meant to fill** if it isn't already stated —
   more mid-game content? A new hook for returning players? Variety in the
   puzzle space? Don't assume; a wrong guess wastes the round.
2. **Generate 3 distinct directions**, each stated as: one-sentence pitch,
   what new decision it adds to the existing puzzle (or what other loop it
   serves — economy, progression, session-return), rough scope (a data-only
   addition vs. needing a new UI surface vs. needing new game logic), and
   the biggest open question about it.
3. **Present all three together** and let the user pick, combine, or ask
   for different directions — don't silently pick one yourself.
4. **Hand off, don't implement from here.** Once a direction is chosen:
   - If it's balance/mechanics detail work → `game-design-loop`
   - If it's a specific Stage/trap/monster/hero → `dungeon-content-design`
   - If it needs review before building → `design-review`
   - If it's ready to build → `browser-game-dev`'s build-and-verify loop

This skill produces a shortlist of directions, not a shipped feature —
resist the pull to start implementing mid-brainstorm.
