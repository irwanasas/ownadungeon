---
name: game-design-loop
description: >-
  Use when the user asks about game mechanics, core loop pacing, matchup
  balance, the gold/soul economy, upgrade progression, or King/Stage/Arcade
  design in Own a Dungeon. Triggers on "balance", "mechanic", "core loop",
  "progression", "economy", "matchup", "difficulty curve". Adapted from
  AlterLab-IEU/AlterLab_GameForge's game-designer agent — trimmed from a
  fictional-persona, multi-agent studio role to a direct-advice skill
  scoped to this game's actual systems.
license: MIT
---

# Own a Dungeon — Mechanics & Balance

Source: condensed from
[AlterLab-IEU/AlterLab_GameForge](https://github.com/AlterLab-IEU/AlterLab_GameForge)'s
`game-designer` agent. The original is a persona-driven role meant to be
spawned as a subagent inside a multi-role studio pipeline and references
docs (`@docs/game-design-theory.md`) that don't exist in this repo. This
version keeps the useful design frameworks and reapplies them directly to
this game's actual mechanics — no persona, no subagent spawning, no
external doc dependencies.

## This game's actual systems (ground every suggestion here)

- **The puzzle is Hero × Monster × Trap**, not raw stat comparison — the
  matchup matrix lives in `src/data/matchups.ts` (advantage ≈ ×1.25,
  disadvantage ≈ ×0.8, plus special interactions: net blocks Berserker
  RAGE, Frost affects DEF, Holy/Magic bonuses vs undead/shade). Any new
  hero/monster/trap must be evaluated against this matrix for both new
  advantages and unintended stacking — the project's own rule is that no
  multiplier should stack to "broken."
- **Progression has two tracks that must stay distinct:** Stage 1–50 is
  hand-authored puzzle content (`src/data/stages.ts`) with per-stage
  unlocks and a first-clear bonus; Arcade is unbounded wave scaling with
  light stat growth and a random hero roster from already-unlocked
  classes. Don't blur these — a Stage-only balance fix shouldn't leak stat
  scaling into Arcade, and vice versa.
- **Economy** is gold + souls (`src/economy/economy.ts`) feeding
  `src/data/upgrades.ts` (item leveling, unlocks, King leveling). King is
  a duel boss at the Throne room, not just a stat sheet — treat King
  upgrades as both an economy sink and a difficulty lever.

## Core-loop framing (from the original skill, kept because it's genuinely useful)

Evaluate any new system or balance change at the timescale it actually
lives at:

- **Moment-to-moment (per room resolve):** is the trap/monster/hero
  interaction legible in the compact battle card (HP bar + reaction text)
  without needing a wiki? If a player can't tell *why* they won or lost a
  room from the UI alone, that's a design bug before it's a balance bug.
- **Per-raid (5–15 rooms):** does room-to-room variety keep the puzzle
  interesting, or does one dominant trap/monster combo trivialize most
  rooms? Check against the matchup matrix for a combo that wins
  everywhere.
- **Session (one sitting):** does the Stage/Arcade split still give a
  reason to switch between them, or has one become strictly better?
- **Long-run (across sessions):** does the upgrade curve in
  `upgrades.ts` keep producing meaningful decisions, or does gold/soul
  income outpace sink costs (inflation) or fall behind them (grind wall)?
  Sanity-check new content against this before shipping it.

## When proposing a change

1. State which of the four timescales above it targets and why.
2. Trace it through `matchups.ts` / `stages.ts` / `upgrades.ts` as
   relevant — don't propose a new trap or hero without checking how it
   slots into the existing 5×5×5 (hero × monster × trap) matrix.
3. Flag anything that would require a new UI surface (new overlay, new
   HUD element) separately — that's an implementation-scope question, not
   a balance question, and belongs in a plan before code.
4. For genuinely open-ended "what should we add" questions rather than
   tuning an existing system, use the `feature-brainstorm` skill instead —
   this skill is for reasoning about mechanics that already exist or are
   already scoped.
