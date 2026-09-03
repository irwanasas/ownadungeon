import type { Hero, MonsterDef, RaidDifficulty } from '../types';
import type { BeatKey } from '../animation/beatTiming';
import { checkPanic, triggerDeath, triggerFear, triggerFlee, triggerPain, triggerSurprise, tryTriggerRage } from './hero';
import { applySpecialOnMonsterHit, heroMonsterMult } from '../data/matchups';
import { flashSlot } from '../ui/dungeonSlots';
import { updateBattleCard } from '../ui/roomPreview';

export interface MonsterEncounterResult {
  heroDied: boolean;
  heroEscaped: boolean;
  goldReward: number;
}

export async function resolveMonsterEncounter(
  hero: Hero,
  monCat: MonsterDef,
  level: number,
  stageDiff: RaidDifficulty,
  waitBeat: (key: BeatKey) => Promise<void>,
  slotEl: Element | null
): Promise<MonsterEncounterResult> {
  var monHp = Math.round((monCat.baseHp + (level - 1) * monCat.hpPerLevel) * stageDiff.monsterHpMult);
  var monAtk = Math.round((monCat.baseAtk + (level - 1) * monCat.atkPerLevel) * stageDiff.monsterAtkMult);
  var monDef = monCat.baseDef || 0;

  triggerSurprise(hero);
  await waitBeat('threat');
  await waitBeat('actionGap');

  if (monCat.fearAura && !hero.fearImmune) {
    if (Math.random() < 0.22) {
      hero.atk = Math.max(1, Math.round(hero.atk * 0.9));
      triggerFear(hero);
    }
  }

  var levelGap = level - hero.level;
  if (!hero.fearImmune && levelGap >= hero.fleeThreshold) {
    triggerFlee(hero);
    await waitBeat('resolve');
    return { heroDied: false, heroEscaped: true, goldReward: 0 };
  }

  var goldReward = 0;
  var mHp = monHp;
  var roundIndex = 0;
  while (mHp > 0 && hero.hp > 0) {
    await waitBeat('combatRound');

    if (hero.regenPerRound) {
      hero.hp = Math.min(hero.maxHp, hero.hp + Math.round(hero.maxHp * hero.regenPerRound));
    }

    hero.status = hero.status.filter(function (s) {
      if (s.type === 'poison' && s.rounds > 0) {
        hero.hp -= s.dmg;
        s.rounds--;
        return s.rounds > 0;
      }
      return true;
    });
    updateBattleCard(hero);
    checkPanic(hero);
    if (hero.hp <= 0) break;

    if (tryTriggerRage(hero)) {
      updateBattleCard(hero);
      await waitBeat('actionGap');
    }

    var mMult = heroMonsterMult(hero.classId, monCat.id);
    var timingMult = roundIndex === 0 ? (hero.burstMultiplier || 1) : 1;
    if (hero.rampPerRound) {
      timingMult *= 1 + Math.min(hero.rampCap || 0, hero.rampPerRound * roundIndex);
    }
    var raw = Math.max(1, hero.atk - monDef);
    if (hero.magicAtk) raw = Math.max(1, hero.atk - Math.floor(monDef * 0.4));
    var hit = applySpecialOnMonsterHit(hero, monCat, Math.round(raw * mMult * timingMult));
    var hDmg = Math.max(1, hit.dmg);
    mHp -= hDmg;

    if (mHp <= 0) {
      flashSlot(slotEl, 'cleared');
      goldReward += 10 + level * 4;
      break;
    }

    if (!(hero.evasion && Math.random() < hero.evasion)) {
      var mDmg = Math.max(1, monAtk - hero.def);
      if (hero.damageReduction) mDmg = Math.round(mDmg * (1 - hero.damageReduction));
      hero.hp -= mDmg;
      triggerPain(hero);
    }
    updateBattleCard(hero);
    checkPanic(hero);
    roundIndex++;
  }

  await waitBeat('resolve');

  if (hero.hp <= 0) {
    flashSlot(slotEl, 'kill');
    triggerDeath(hero);
    return { heroDied: true, heroEscaped: false, goldReward };
  }
  return { heroDied: false, heroEscaped: false, goldReward };
}
