import { state } from '../state/gameState';
import { HERO_ARCHETYPES, NAME_POOL } from '../data/heroes';
import { getRaidDiff } from './difficultyResolver';
import { setReaction, updateHeroCardVisual } from '../ui/heroCard';
import { isUnlocked } from '../economy/economy';
import type { Hero } from '../types';

export function buildHero(): Hero {
  const arch =
    HERO_ARCHETYPES[Math.floor(Math.random() * HERO_ARCHETYPES.length)];
  const name = NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
  const unlockedLevels = Object.keys(state.levels).filter(function (id) {
    return isUnlocked(id) || id === 'spike' || id === 'skeleton';
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
    trapEvasion: arch.trapEvasion || 0,
    canRage: !!arch.canRage,
    rageHpThreshold: arch.rageHpThreshold || 0.3,
    rageAtkMultiplier: arch.rageAtkMultiplier || 1.5,
    rageHealFraction: arch.rageHealFraction || 0.15,
    magicAtk: !!arch.magicAtk,
    holy: !!arch.holy,
    tags: arch.tags ? arch.tags.slice() : [],
    strengths: arch.strengths || '',
    weaknesses: arch.weaknesses || '',
    hasRaged: false,
    netBlocksRage: false,
    status: [],
    visualState: 'idle'
  };
}

function setHeroReaction(hero: Hero, text: string): void {
  setReaction(text);
  updateHeroCardVisual(hero);
}

export function checkPanic(hero: Hero): void {
  if (!hero || hero.hp <= 0) return;
  if (hero.visualState === 'dead' || hero.visualState === 'flee') return;
  if (hero.hp / hero.maxHp <= 0.35 && hero.visualState !== 'rage') {
    hero.visualState = 'panic';
    setHeroReaction(hero, 'PANIK');
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
  setHeroReaction(hero, 'RAGE');
  return true;
}

export function triggerFlee(hero: Hero): void {
  if (!hero) return;
  hero.visualState = 'flee';
  setHeroReaction(hero, 'KABUR');
}

export function triggerDeath(hero: Hero): void {
  if (!hero) return;
  hero.hp = 0;
  hero.visualState = 'dead';
  setHeroReaction(hero, '');
}
