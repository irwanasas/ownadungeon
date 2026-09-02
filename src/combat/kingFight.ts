import type { Hero, RaidDifficulty } from '../types';
import type { BeatKey } from '../animation/beatTiming';
import { state } from '../state/gameState';
import { getKingStats } from '../data/king';
import { checkPanic, triggerDeath, triggerPain, triggerSurprise, tryTriggerRage } from './hero';
import { flashSlot } from '../ui/dungeonSlots';
import { updateBattleCard } from '../ui/roomPreview';

export interface KingFightResult {
  heroDied: boolean;
  heroVictory: boolean;
  goldReward: number;
  soulsReward: number;
}

export async function resolveKingFight(
  hero: Hero,
  stageDiff: RaidDifficulty,
  waitBeat: (key: BeatKey) => Promise<void>,
  throneEl: Element | null
): Promise<KingFightResult> {
  triggerSurprise(hero);
  await waitBeat('threat');

  var king = getKingStats(state.king && state.king.level);
  var kHp = Math.round(king.maxHp * stageDiff.kingMult);
  var kAtk = Math.round(king.atk * stageDiff.kingMult);
  var kDef = Math.max(0, Math.round(king.def * stageDiff.kingMult));

  await waitBeat('actionGap');

  var goldReward = 0;
  var soulsReward = 0;
  var heroVictory = false;

  while (kHp > 0 && hero.hp > 0) {
    await waitBeat('combatRound');

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

    var hDmg = Math.max(1, hero.atk - kDef);
    kHp -= hDmg;

    if (kHp <= 0) {
      flashSlot(throneEl, 'cleared');
      goldReward += 35 + king.level * 10;
      soulsReward += 1;
      heroVictory = true;
      break;
    }

    var mDmg = Math.max(1, kAtk - hero.def);
    hero.hp -= mDmg;
    triggerPain(hero);
    updateBattleCard(hero);
    checkPanic(hero);
  }

  await waitBeat('resolve');

  var heroDied = hero.hp <= 0;
  if (heroDied) {
    flashSlot(throneEl, 'kill');
    triggerDeath(hero);
  }

  return { heroDied, heroVictory, goldReward, soulsReward };
}
