---
name: design-review
description: >-
  Use when reviewing a proposed mechanic, balance change, or content
  addition in Own a Dungeon before implementing it — checks completeness,
  internal consistency, and implementability. Triggers on "review this
  design", "does this make sense", "before I build this". Adapted from
  Donchitos/Claude-Code-Game-Studios' design-review skill — the original
  reviews a formal GDD file against a design/gdd/ directory tree and
  spawns 3+ specialist subagents; this version reviews a proposed change
  directly against this game's real systems, single-session.
license: MIT
---

# Own a Dungeon — Design Review

Source: condensed from
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)'
`design-review` skill. The original assumes a formal Game Design Document
per system, a `design/gdd/systems-index.md` tracking file, and multi-agent
adversarial review (`economy-designer`, `level-designer`,
`performance-analyst`, etc. spawned via `Task`). This project has no GDD
directory and no such subagents — designs here are usually a paragraph of
intent plus a data-file sketch. This version runs the same *checks* in one
pass against the game's actual systems, without the document pipeline.

## What to review before implementing a proposed change

**Completeness** — does the proposal actually answer:
- What's the player-facing effect (what changes in the UI, the matchup
  outcome, the economy)?
- What's the exact rule/formula, not just the intent? ("stronger vs
  undead" isn't implementable; "×1.25 damage vs undead-tagged monsters,
  matching the existing advantage multiplier in `matchups.ts`" is.)
- What are the edge cases — what happens at 0 HP, at max upgrade level, at
  the first stage where it's available, in Arcade vs Stage?
- What does it depend on / what depends on it — does it touch
  `matchups.ts`, does it need a new UI element, does it interact with an
  existing special rule (net-blocks-rage, Frost DEF, Holy bonus)?

**Internal consistency** — check against `game-design-loop` skill's
framing:
- Do the numbers actually produce the stated effect at realistic values
  (plug in min/max plausible stats, not just the "expected" case)?
- Does it contradict an existing special interaction in `matchups.ts`, or
  stack multiplicatively with one in a way that breaks "nothing stacks to
  broken" (this project's own stated rule)?
- Is it consistent with the Stage/Arcade split (see `game-design-loop`) —
  does it assume hand-authored puzzle context that wouldn't hold in
  Arcade's random roster, or vice versa?

**Implementability** — check against `tech-architecture` skill:
- Does it fit the existing `src/data/` → `src/combat/` → `src/ui/`
  layering, or does it imply a new architectural layer that needs to be
  called out first?
- Is there a "hand-wave" — a described effect with no concrete
  mechanism (e.g. "feels more dangerous" with no stat/rule attached)?

## Output format

Keep it short and direct — no subagent swarm, no document to write unless
asked:

```
## Review: [proposed change]

Completeness: [what's specified / what's missing]
Consistency: [any conflicts with matchups.ts / existing special rules]
Implementability: [does it fit the existing layers cleanly, or not]

Blocking (must resolve before implementing):
- ...

Recommended (should address, not blocking):
- ...

Verdict: [ready to implement / needs another pass on X]
```

## When to escalate beyond this skill

If the review surfaces a genuine architecture question (not "is this
balanced" but "does this need a new subsystem"), hand off to
`tech-architecture`. If it surfaces that the underlying idea isn't
sharp yet, hand off to `feature-brainstorm` rather than trying to review a
half-formed idea into shape.
