export type ItemKind = 'trap' | 'monster' | 'treasure';

export interface Cost {
  gold: number;
  souls: number;
}

export interface TrapDef {
  id: string;
  name: string;
  icon: string;
  kind: 'trap';
  tags: string[];
  desc: string;
  baseDamage: number;
  dmgPerLevel: number;
  cost: Cost;
  dotRounds?: number;
  atkReduction?: number;
  burnRounds?: number;
  defReduction?: number;
}

export type MonsterType = 'ranged' | 'brute' | 'tank' | 'resist' | 'ethereal';

export interface MonsterDef {
  id: string;
  name: string;
  icon: string;
  kind: 'monster';
  type: MonsterType;
  tags: string[];
  desc: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  hpPerLevel: number;
  atkPerLevel: number;
  cost: Cost;
  physicalResist?: number;
  fearAura?: number;
}

export interface TreasureDef {
  id: string;
  name: string;
  icon: string;
  kind: 'treasure';
  desc: string;
}

export type CatalogItem = TrapDef | MonsterDef | TreasureDef;

export interface HeroArchetype {
  id: string;
  name: string;
  className: string;
  icon: string;
  color: string;
  role: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  fleeThreshold: number;
  fearImmune: boolean;
  canRage: boolean;
  rageHpThreshold?: number;
  rageAtkMultiplier?: number;
  rageHealFraction?: number;
  evasion: number;
  damageReduction?: number;
  regenPerRound?: number;
  burstMultiplier?: number;
  rampPerRound?: number;
  rampCap?: number;
  elementalAffinity?: boolean;
  natureResist?: boolean;
  tags: string[];
  strengths: string;
  weaknesses: string;
  magicAtk?: boolean;
}

export interface KingBase {
  maxHp: number;
  atk: number;
  def: number;
  hpPerLevel: number;
  atkPerLevel: number;
  defPerLevel: number;
}

export interface KingStats {
  level: number;
  maxHp: number;
  atk: number;
  def: number;
}

export interface KingUpgradeDef {
  baseGold: number;
  goldGrowth: number;
  soulsEvery: number;
  soulsBase: number;
}

export interface RaidDifficulty {
  trapMult: number;
  monsterHpMult: number;
  monsterAtkMult: number;
  kingMult: number;
  rewardMult: number;
  heroLevelBonus: number;
  stage?: number;
  band?: number;
  wave?: number;
  firstClearBonusGold?: number;
  firstClearBonusSouls?: number;
  compositionHint?: string;
}

export interface StageDifficulty extends RaidDifficulty {
  stage: number;
  band: number;
  compositionHint: string;
  firstClearBonusGold: number;
  firstClearBonusSouls: number;
}

export interface ArcadeDifficulty extends RaidDifficulty {
  wave: number;
}

export interface UpgradeDef {
  id: string;
  label: string;
  type: 'trap' | 'monster';
  baseCost: number;
  requiresUnlock?: string;
}

export interface UnlockDef {
  id: string;
  label: string;
  cost: Cost;
  unlockAtStage?: number;
}

export interface StageDef {
  stage: number;
  heroPool: string[];
  note: string;
}

export type GameMode = 'stage' | 'arcade';

export interface DungeonSlotData {
  catalogId: string;
  kind: ItemKind;
}

export interface GameStats {
  raidsTotal: number;
  dungeonWins: number;
  heroEscapes: number;
  heroVictories: number;
}

export interface KingState {
  level: number;
}

export interface GameState {
  gold: number;
  souls: number;
  slotCount: number;
  maxSlotCount: number;
  dungeon: (DungeonSlotData | null)[];
  levels: Record<string, number>;
  unlocked: Record<string, boolean>;
  stats: GameStats;
  king: KingState;
  mode: GameMode;
  stage: number;
  maxStageCleared: number;
  arcadeWave: number;
  arcadeBest: number;
  lastActive: number;
}

export interface SelectedPaletteItem {
  id: string;
  kind: ItemKind;
}

export interface RuntimeState {
  selectedPaletteItem: SelectedPaletteItem | null;
  raidInProgress: boolean;
  pendingHero: Hero | null;
}

export type HeroVisualState = 'idle' | 'panic' | 'rage' | 'flee' | 'dead';

export interface HeroStatusEffect {
  type: 'poison';
  rounds: number;
  dmg: number;
}

export interface Hero {
  name: string;
  classId: string;
  className: string;
  icon: string;
  color: string;
  role: string;
  level: number;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  fleeThreshold: number;
  fearImmune: boolean;
  evasion: number;
  damageReduction: number;
  regenPerRound: number;
  burstMultiplier: number;
  rampPerRound: number;
  rampCap: number;
  elementalAffinity: boolean;
  natureResist: boolean;
  canRage: boolean;
  rageHpThreshold: number;
  rageAtkMultiplier: number;
  rageHealFraction: number;
  magicAtk: boolean;
  tags: string[];
  strengths: string;
  weaknesses: string;
  hasRaged: boolean;
  netBlocksRage: boolean;
  status: HeroStatusEffect[];
  visualState: HeroVisualState;
  _firstStrikeUsed?: boolean;
}

export interface OfflineProgressSummary {
  raids: number;
  gold: number;
  souls: number;
  wins: number;
  hours: string;
}

export type ToastType = 'info' | 'success' | 'warning';

export type ReactionKind = 'none' | 'panic' | 'rage' | 'flee' | 'fear' | 'pain' | 'surprise' | 'dead';
