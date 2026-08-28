function buildHero() {
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
  var stageBonus = 0;
  if (typeof state !== 'undefined' && typeof getRaidDiff === 'function') {
    stageBonus = getRaidDiff().heroLevelBonus || 0;
  } else if (typeof state !== 'undefined' && state.mode === 'stage' && typeof getStageDiff === 'function') {
    stageBonus = getStageDiff(state.stage).heroLevelBonus;
  }
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

function getHeroIcon(hero) {
  if (!hero) return '⚔';
  if (hero.visualState === 'dead') return '💀';
  if (hero.visualState === 'flee') return '💨';
  if (hero.visualState === 'rage') return '🔥';
  if (hero.visualState === 'panic') return '😰';
  return hero.icon || '⚔';
}

function setHeroReaction(hero, text) {
  if (typeof setReaction === 'function') setReaction(text);
  if (typeof updateHeroCardVisual === 'function') updateHeroCardVisual(hero);
}

function checkPanic(hero) {
  if (!hero || hero.hp <= 0) return;
  if (hero.visualState === 'dead' || hero.visualState === 'flee') return;
  if (hero.hp / hero.maxHp <= 0.35 && hero.visualState !== 'rage') {
    hero.visualState = 'panic';
    setHeroReaction(hero, 'PANIK');
  }
}

function tryTriggerRage(hero) {
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

function triggerFlee(hero) {
  if (!hero) return;
  hero.visualState = 'flee';
  setHeroReaction(hero, 'KABUR');
}

function triggerDeath(hero) {
  if (!hero) return;
  hero.hp = 0;
  hero.visualState = 'dead';
  setHeroReaction(hero, '');
  if (typeof updateHeroCardVisual === 'function') updateHeroCardVisual(hero);
}
