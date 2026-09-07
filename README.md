# Own a Dungeon

A mobile-first browser game. You do not play the hero — you own the dungeon
they walk into.

Build five rooms, leave the Throne Room to the King, press RAID, and watch an
autonomous hero try to get through. They decide what to fight, what to loot,
and when to run. You only get to decide what is waiting for them.

Play: <https://irwanasas.github.io/ownadungeon/>

## The loop

```
BUILD -> RAID -> WATCH -> REWARD -> UPGRADE -> REDESIGN
```

The dungeon is a fixed six-room corridor you swipe through horizontally:

```
ENTRANCE -> ROOM 1..5 (yours) -> THRONE ROOM (permanent)
```

## What makes a dungeon good

Not bigger numbers — order. Every trap and monster carries a damage tag,
every status carries tags and can block a hero trait, and one interaction
table decides what happens when they meet. That is the whole depth system;
there are no per-hero special cases.

**The same thing fits in two rooms at most.** No spamming five Spike Pits —
five rooms means at least three different ideas, so the combinations below are
not optional.

| Combination | Result |
| --- | --- |
| Oil Slick, then Fire Jet | **IGNITION** — 2.2x damage and the hero catches fire |
| Net, then anything physical | **PINNED** — no dodge, no rage, 1.5x damage |
| Frost, then a multi-hit monster | **BRITTLE** — dodge collapses, armour thins |
| Fire on a Druid | Burning blocks all healing |
| Frost on a burning hero | **DOUSED** — you just put your own fire out |
| Treasure after a poison cloud | Greedy heroes stop to loot, and keep breathing it |

A Cursed Relic is the sharpest tool in the box: a hero who takes it can no
longer flee, so they die in your dungeon instead of walking out.

## The heroes

Six archetypes, each with a real mechanical identity and a real counter.

| Hero | Identity | Counter |
| --- | --- | --- |
| Paladin | Mitigates every direct hit, immune to fear | Poison and burn tick past armour |
| Berserker | Rages when wounded, never retreats | A Net blocks rage outright |
| Trickster | Dodges ~45% of everything, disarms traps | Chill or Net strips the dodge |
| Assassin | Devastating first strike, 36 HP | Anything that survives the opener |
| Druid | Heals every round, shrugs off poison | Burning shuts the healing off |
| Elementalist | Grows stronger every round of a fight | Kill fast, or Weaken/Net the ramp |

Heroes are named, persist between raids, gain levels, and come back scarred:
die to poison once and Sir William returns poison-resistant. Your dungeon
teaches them.

## The world above

Every few raids a herald brings news — rumours, wars, plagues, discoveries,
festivals. Roughly half is pure flavour. The rest bends the rules for two to
four raids: a war drills warriors harder, a drought makes fire bite deeper, a
pilgrim season fattens the soul take. Some events lead to others, so a border
skirmish can become a war and then an exhausted levy that sends mages instead.

Effects are visible on the World tab before you press RAID, at most two run at
once, and every multiplier is clamped. They are meant to change what the right
dungeon looks like this week, not to be survived passively.

Adding an event is a data change — one entry in `game/content/worldEvents.ts`.
Everything else reads a single resolved object from `worldModifiers()`.

## Modes

- **Stage** — 20 handcrafted stages, each introducing exactly one idea.
- **Arcade** — endless waves, escalating hero and King levels, best-wave tracking.
- **Offline** — the dungeon keeps working while you are away, up to 8 hours,
  simulated deterministically on return.

Gold levels up what you own. Souls upgrade the King and buy content ahead of
its stage gate — and the further ahead you reach, the dearer it gets, so
impatience costs real souls rather than skipping the ladder for free.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run type-check
npm run build      # static export to out/
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy-pages.yml`.

## How it is built

Next.js App Router, static export, TypeScript, React. No game engine, no canvas —
the dungeon is DOM and CSS, and it scrolls natively so touch feels right.

```
game/          simulation and data — no DOM, no React
  content/     heroes, monsters, traps, treasure, statuses, interactions, stages
  state/       save, economy, persistent hero roster
  sim/         hero instances, AI decisions, raid loop, offline batch sim
app/game/      presentation
  GameShell    state and orchestration
  DungeonView  the scrolling six-room world
  useRaidDirector  turns the simulation's event log into timed animation
  panels/overlays  build, upgrade, codex, result, offline, tutorial
scripts/art/   regenerates every sprite and UI frame from assets-src/room/Room.png
```

`simulateRaid()` returns an ordered `RaidEvent[]` and nothing else. The
presentation layer is the only thing that knows what a pixel is, and it just
plays that list back with timing and sound. The same function runs the offline
simulation with events switched off.

## Art

Every room backdrop, door, torch and UI frame is cut from the single tileset in
`assets-src/room/`. Nothing is drawn by hand on top of it, and the UI chrome
frames are sampled from the same stone as the walls. Regenerate with:

```bash
cd scripts/art && python3 gen_rooms.py && python3 gen_entities.py && python3 gen_ui.py
```
