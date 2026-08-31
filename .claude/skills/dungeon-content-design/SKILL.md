---
name: dungeon-content-design
description: >-
  Use when designing or tuning new dungeon content in Own a Dungeon — a new
  Stage puzzle, a new hero/monster/trap, or Arcade scaling. Triggers on
  "level design", "new stage", "design a puzzle", "new room". Adapted from
  Donchitos/Claude-Code-Game-Studios' team-level workflow — the original
  spawns a 6-agent studio team (narrative-director, world-builder,
  level-designer, systems-designer, art-director, accessibility-specialist,
  qa-tester) against a design/gdd/ + design/levels/ document tree that
  don't exist in this project. This version is a single-session content
  design pass scoped to this game's actual data files.
license: MIT
---

# Own a Dungeon — Dungeon Content Design

Source: condensed from
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)'
`team-level` skill. "Level design" in that framework means spatial area
layout with narrative beats, spawned across a multi-agent studio team. Own
a Dungeon has no spatial levels or narrative — a "level" here is a Stage
entry: a specific room-by-room puzzle of hero/monster/trap placements plus
unlocks (`src/data/stages.ts`), or new content (`traps.ts`, `monsters.ts`,
`heroes.ts`) that plugs into the matchup matrix. No subagent team — this is
solo design work against real data files.

## Designing a new Stage entry

1. **Read `src/data/stages.ts`** for the surrounding stages (a few before
   and after the target stage number) to see the established difficulty
   ramp and unlock cadence — a new stage should sit coherently in that
   curve, not spike or trivialize it.
2. **Pick the puzzle's teaching point.** Every stage should be testing or
   teaching something specific about the Hero × Monster × Trap matchup
   matrix (`src/data/matchups.ts`) — state it in one sentence (e.g. "tests
   whether the player nets the Berserker before it RAGEs"). If you can't
   state that sentence, the stage doesn't have a clear identity yet.
3. **Check the matchup matrix for the intended solution** — verify the
   hero/monster/trap combo you're designing around actually produces the
   outcome you intend (advantage ≈ ×1.25 / disadvantage ≈ ×0.8 / special
   interactions), and check there isn't a trivial off-path solution that
   defeats the puzzle's point.
4. **Set the unlock and first-clear bonus** consistent with neighboring
   stages — don't gate content behind a stage whose difficulty doesn't
   justify the gate.
5. **Verify per `qa-verification`**: play the stage through in a real
   browser pass, confirm the puzzle resolves as intended and the intended
   "trap" solution (going in blind, or the wrong trap) actually fails
   the way the design expects.

## Designing new content (trap / monster / hero)

1. **Where it lives:** `src/data/traps.ts`, `monsters.ts`, or `heroes.ts`
   for the base stats/definition; `src/data/matchups.ts` for how it
   interacts with everything already in the 5×5×5 matrix.
2. **Justify the addition against what already exists** — a new trap/
   monster/hero should create a new decision, not a strictly-better or
   strictly-worse version of an existing one. Compare stats and special
   interactions against the current five of each type.
3. **Wire the full path**, not just the data: matchup entries, any new
   matchup-hint text so the "Enemy Detected" panel can explain it, and — if
   visually distinct — a sprite/icon (see `art-direction` skill).
4. **Check Arcade too.** New heroes/monsters enter the Arcade random roster
   automatically once unlocked — confirm the new content doesn't break
   Arcade's light stat-scaling balance even though Arcade doesn't use
   hand-authored puzzles.

## Not applicable here

Spatial level layout, camera framing, narrative beats/dialogue per area,
environmental storytelling, accessibility passes for 3D navigation — this
game has none of those; "level design" is data-driven puzzle content, not
a built space. For pure ideation on what new content to add, use
`feature-brainstorm` first, then this skill to design the specifics.
