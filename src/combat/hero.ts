import { state } from '../state/gameState';
import { runtime } from '../state/runtimeState';
import { HERO_ARCHETYPES, NAME_POOL } from '../data/heroes';
import { getStageDef } from '../data/stages';
import { getRaidDiff } from './difficultyResolver';
import { setBattleReaction, syncBattleCardVisual } from '../ui/battleReaction';
import { isUnlocked } from '../economy/economy';
import type { Hero, ReactionKind } from '../types';

function eligibleArchetypes() {
  if (state.mode !== 'stage') return HERO_ARCHETYPES;
  const pool = getStageDef(state.stage).heroPool;
  const filtered = HERO_ARCHETYPES.filter((a) => pool.includes(a.id));
  return filtered.length ? filtered : HERO_ARCHETYPES;
}

export function buildHero(): Hero {
  const roster = eligibleArchetypes();
  const arch = roster[Math.floor(Math.random() * roster.length)];
  const name = NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
  const unlockedLevels = Object.keys(state.levels).filter(function (id) {
    return isUnlocked(id) || id === 'spike' || id === 'slime';
  });
  const vals = unlockedLevels.map(function (id) {
    return state.levels[id] || 1;
  });
  const avgLevel = Math.max(
    1,
    Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / Math.max(1, vals.length))
  );
  const stageBonus = getRaidDiff().heroLevelBonus || 0;
  const level = Math.max(1, avgLevel + Math.floor(Math.random() * 3) - 1 + stageBonus);
  const hp = Math.round(arch.baseHp + (level - 1) * 8);
  const atk = Math.round(arch.baseAtk + (level - 1) * 1.5);
  const def = Math.round(arch.baseDef + (level - 1) * 0.4);

  return {
    name: name,
    classId: arch.id,
    className: arch.className,
    icon: arch.icon,
    color: arch.color,
    role: arch.role,
    level: level,
    maxHp: hp,
    hp: hp,
    atk: atk,
    def: def,
    fleeThreshold: arch.fleeThreshold,
    fearImmune: !!arch.fearImmune,
    evasion: arch.evasion || 0,
    damageReduction: arch.damageReduction || 0,
    regenPerRound: arch.regenPerRound || 0,
    burstMultiplier: arch.burstMultiplier || 1,
    rampPerRound: arch.rampPerRound || 0,
    rampCap: arch.rampCap || 0,
    elementalAffinity: !!arch.elementalAffinity,
    natureResist: !!arch.natureResist,
    canRage: !!arch.canRage,
    rageHpThreshold: arch.rageHpThreshold || 0.3,
    rageAtkMultiplier: arch.rageAtkMultiplier || 1.5,
    rageHealFraction: arch.rageHealFraction || 0.15,
    magicAtk: !!arch.magicAtk,
    tags: arch.tags ? arch.tags.slice() : [],
    strengths: arch.strengths || '',
    weaknesses: arch.weaknesses || '',
    hasRaged: false,
    netBlocksRage: false,
    status: [],
    visualState: 'idle'
  };
}

export function clearPendingHero(): void {
  runtime.pendingHero = null;
}

export function ensurePendingHero(): Hero {
  if (!runtime.pendingHero) {
    runtime.pendingHero = buildHero();
  }
  return runtime.pendingHero;
}

export function takePendingHero(): Hero {
  var hero = ensurePendingHero();
  runtime.pendingHero = null;
  return hero;
}

function setHeroReaction(hero: Hero, kind: ReactionKind, text: string): void {
  setBattleReaction(text, kind);
  syncBattleCardVisual(hero);
}

export function checkPanic(hero: Hero): void {
  if (!hero || hero.hp <= 0) return;
  if (hero.visualState === 'dead' || hero.visualState === 'flee') return;
  if (hero.hp / hero.maxHp <= 0.35 && hero.visualState !== 'rage') {
    hero.visualState = 'panic';
    setHeroReaction(hero, 'panic', 'PANIK');
  }
}

export function tryTriggerRage(hero: Hero): boolean {
  if (!hero || !hero.canRage || hero.hasRaged) return false;
  if (hero.netBlocksRage) return false;
  if (hero.hp / hero.maxHp > hero.rageHpThreshold) return false;
  hero.hasRaged = true;
  hero.visualState = 'rage';
  hero.atk = Math.round(hero.atk * hero.rageAtkMultiplier);
  hero.hp = Math.min(
    hero.maxHp,
    hero.hp + Math.round(hero.maxHp * hero.rageHealFraction)
  );
  setHeroReaction(hero, 'rage', 'RAGE');
  return true;
}

export function triggerFlee(hero: Hero): void {
  if (!hero) return;
  hero.visualState = 'flee';
  setHeroReaction(hero, 'flee', 'KABUR');
}

export function triggerDeath(hero: Hero): void {
  if (!hero) return;
  hero.hp = 0;
  hero.visualState = 'dead';
  setHeroReaction(hero, 'dead', '');
}

export function triggerPain(hero: Hero): void {
  if (!hero || hero.hp <= 0) return;
  if (hero.visualState === 'dead' || hero.visualState === 'flee') return;
  setBattleReaction('SAKIT!', 'pain');
}

export function triggerSurprise(hero: Hero): void {
  if (!hero || hero.hp <= 0) return;
  if (hero.visualState === 'dead' || hero.visualState === 'flee') return;
  setBattleReaction('TERKEJUT', 'surprise');
}

export function triggerFear(hero: Hero): void {
  if (!hero || hero.hp <= 0 || hero.fearImmune) return;
  if (hero.visualState === 'dead' || hero.visualState === 'flee') return;
  setBattleReaction('TAKUT', 'fear');
}
