// Pure data/simulation types for the dungeon-raid engine. No DOM, no React —
// this file and everything else in engine/ must stay renderer-agnostic so the
// simulation can be tested and reasoned about independently of how it's drawn.

export type DamageTag = 'physical' | 'fire' | 'poison' | 'frost' | 'arcane';
export type StatusKind = 'poison' | 'burn' | 'chill' | 'weaken';

export interface HeroStatus {
  kind: StatusKind;
  roomsLeft: number;
  dmgPerTick?: number;
  evasionDelta?: number;
  atkMult?: number;
}

export interface HeroDef {
  id: string;
  name: string;
  family: 'warrior' | 'rogue' | 'mage';
  role: string;
  color: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  evasion: number;
  damageReduction: number;
  rampPerRound: number;
  rampCap: number;
  fearImmune: boolean;
  resist: DamageTag[];
  strengths: string;
  weaknesses: string;
}

export interface TrapStatusOnHit {
  kind: StatusKind;
  rooms: number;
  dmgPerTick?: number;
  evasionDelta?: number;
}

export interface TrapDef {
  id: string;
  name: string;
  tag: DamageTag;
  baseDamage: number;
  dmgPerLevel: number;
  statusOnHit?: TrapStatusOnHit;
  desc: string;
  goldCost: number;
}

export interface MonsterStatusOnHit {
  kind: StatusKind;
  rooms: number;
  atkMult?: number;
}

export interface MonsterDef {
  id: string;
  name: string;
  role: 'brute' | 'swarm' | 'shaman' | 'boss';
  tag: DamageTag;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  hpPerLevel: number;
  atkPerLevel: number;
  hitsPerRound: number;
  appliesStatus?: MonsterStatusOnHit;
  desc: string;
  goldCost: number;
  goldValue: number;
}

export type RoomContent =
  | { kind: 'empty' }
  | { kind: 'trap'; trapId: string; level: number }
  | { kind: 'monster'; monsterId: string; level: number };

export interface DungeonConfig {
  rooms: RoomContent[];
}

export interface StageDef {
  id: number;
  title: string;
  heroPool: string[];
  unlockTrapIds: string[];
  unlockMonsterIds: string[];
  kingLevel: number;
  note: string;
}

// The dungeon is always a fixed 6-room strip: 5 editable rooms plus the
// permanent Throne Room. Progression unlocks new trap/monster content, not
// more room slots.
export const EDITABLE_ROOMS = 5;

// --- Runtime raid state -----------------------------------------------------

export interface HeroInstance {
  defId: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  status: HeroStatus[];
}

export type ReactionKind = 'surprise' | 'pain' | 'panic' | 'rage' | 'flee' | 'dead' | 'none';

export type RaidEvent =
  | { type: 'raidStart'; heroDefId: string; heroName: string; hp: number; maxHp: number }
  | { type: 'enterRoom'; roomIndex: number; kind: 'empty' | 'trap' | 'monster' | 'throne'; contentId?: string }
  | { type: 'doorOpen' }
  | { type: 'trapTrigger'; trapId: string }
  | { type: 'monsterAppear'; monsterId: string }
  | { type: 'heroAttack'; targetHp: number; targetMaxHp: number; dmg: number; crit: boolean }
  | { type: 'monsterAttack'; dmg: number; evaded: boolean }
  | { type: 'damage'; source: 'trap' | 'monster' | 'king' | 'status'; dmg: number; heroHp: number; heroMaxHp: number; evaded: boolean }
  | { type: 'statusApplied'; kind: StatusKind }
  | { type: 'statusTick'; kind: StatusKind; dmg: number; heroHp: number }
  | { type: 'heroReaction'; reaction: ReactionKind }
  | { type: 'monsterDeath'; monsterId: string }
  | { type: 'roomCleared'; roomIndex: number }
  | { type: 'kingAppear'; level: number; hp: number }
  | {
      type: 'raidEnd';
      outcome: 'dungeonWin' | 'heroEscape' | 'heroVictory';
      goldReward: number;
      soulsReward: number;
    };

export interface RaidResult {
  events: RaidEvent[];
  outcome: 'dungeonWin' | 'heroEscape' | 'heroVictory';
  goldReward: number;
  soulsReward: number;
}
