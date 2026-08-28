// Hero entity: spawning a hero for a raid, and the reaction state machine
// (panic / rage / flee / death) that drives combat log messages and visuals.
import { state } from '../state/gameState.js';
import { HERO_ARCHETYPES, NAME_POOL } from '../data/heroes.js';
import { getRaidDiff } from './difficultyResolver.js';
import { setReaction, updateHeroCardVisual } from '../ui/heroCard.js';

export function buildHero() {
  const arch =
    HERO_ARCHETYPES[Math.floor(Math.random() * HERO_ARCHETYPES.length)];
  const name = NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
  const avgLevel = Math.max(
    1,
    Math.round(
      Object.values(state.levels).reduce((a, b) => a + b, 0) /
        Object.keys(state.levels).length
    )
  );
  const stageBonus = getRaidDiff().heroLevelBonus || 0;
  const level = Math.max(1, avgLevel + Math.floor(Math.random() * 3) - 1 + stageBonus);
  const hp = Math.round(arch.baseHp + (level - 1) * 8);
  const atk = Math.round(arch.baseAtk + (level - 1) * 1.5);
  const def = Math.round(arch.baseDef + (level - 1) * 0.4);

  return {
    name,
    className: arch.className,
    icon: arch.icon,
    color: arch.color,
    level,
    maxHp: hp,
    hp,
    atk,
    def,
    fleeThreshold: arch.fleeThreshold,
    fearImmune: !!arch.fearImmune,
    trapEvasion: arch.trapEvasion || 0,
    canRage: !!arch.canRage,
    rageHpThreshold: arch.rageHpThreshold || 0.3,
    rageAtkMultiplier: arch.rageAtkMultiplier || 1.5,
    rageHealFraction: arch.rageHealFraction || 0.15,
    hasRaged: false,
    status: [],
    visualState: 'idle'
  };
}

function setHeroReaction(hero, text) {
  setReaction(text);
  updateHeroCardVisual(hero);
}

export function checkPanic(hero) {
  if (!hero || hero.hp <= 0) return;
  if (hero.visualState === 'dead' || hero.visualState === 'flee') return;
  if (hero.hp / hero.maxHp <= 0.35 && hero.visualState !== 'rage') {
    hero.visualState = 'panic';
    setHeroReaction(hero, 'PANIK');
  }
}

export function tryTriggerRage(hero) {
  if (!hero || !hero.canRage || hero.hasRaged) return false;
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

export function triggerFlee(hero) {
  if (!hero) return;
  hero.visualState = 'flee';
  setHeroReaction(hero, 'KABUR');
}

export function triggerDeath(hero) {
  if (!hero) return;
  hero.hp = 0;
  hero.visualState = 'dead';
  // setHeroReaction() already calls updateHeroCardVisual(hero) internally.
  setHeroReaction(hero, '');
}
