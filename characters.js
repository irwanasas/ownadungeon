/* ========== CHARACTER / HERO LOGIC ========== */

function buildHero() {
  const arch = HERO_ARCHETYPES[Math.floor(Math.random() * HERO_ARCHETYPES.length)];
  const avgLevel = Math.max(
    1,
    Math.round(
      Object.values(state.levels).reduce((a, b) => a + b, 0) /
        Object.keys(state.levels).length
    )
  );

  const level = Math.max(1, avgLevel + Math.floor(Math.random() * 3) - 1);
  const hp = Math.round(arch.baseHp + (level - 1) * 8);
  const atk = Math.round(arch.baseAtk + (level - 1) * 1.5);
  const def = Math.round(arch.baseDef + (level - 1) * 0.4);

  return {
    ...arch,
    name: NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)],
    level,
    maxHp: hp,
    hp,
    atk,
    def,
    status: [],
    raged: false,
    visualState: 'normal'
  };
}

function getHeroIcon(hero) {
  if (!hero) return '⚔';
  if (hero.visualState === 'rage') return '🔥';
  if (hero.visualState === 'flee') return '💨';
  if (hero.visualState === 'panic') return '😰';
  return hero.icon || '⚔';
}

function applyHeroVisualState(hero, nextState) {
  if (!hero) return;
  hero.visualState = nextState;
  if (typeof updateHeroCardVisual === 'function') {
    updateHeroCardVisual(hero);
  }
}

function checkPanic(hero) {
  if (!hero || hero.visualState === 'rage' || hero.visualState === 'flee') return;
  if (hero.hp / hero.maxHp <= 0.3) {
    applyHeroVisualState(hero, 'panic');
    if (typeof setReaction === 'function') setReaction('PANIK...');
  }
}

function tryTriggerRage(hero) {
  if (!hero || !hero.canRage || hero.raged) return false;
  if (hero.hp / hero.maxHp > hero.rageHpThreshold) return false;

  hero.raged = true;
  hero.atk = Math.round(hero.atk * hero.rageAtkMultiplier);
  hero.hp = Math.min(
    hero.maxHp,
    hero.hp + Math.round(hero.maxHp * hero.rageHealFraction)
  );
  applyHeroVisualState(hero, 'rage');
  if (typeof setReaction === 'function') setReaction('RAGE!');
  return true;
}

function triggerFlee(hero) {
  if (!hero) return;
  applyHeroVisualState(hero, 'flee');
  if (typeof setReaction === 'function') setReaction('KABUR!');
}
