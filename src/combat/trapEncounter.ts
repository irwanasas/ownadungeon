import type { Hero, TrapDef, RaidDifficulty } from '../types';
import type { BeatKey } from '../animation/beatTiming';
import { checkPanic, triggerDeath, triggerPain, triggerSurprise } from './hero';
import { applySpecialOnTrap, heroTrapMult } from '../data/matchups';
import { flashSlot } from '../ui/dungeonSlots';
import { updateBattleCard } from '../ui/roomPreview';

export interface TrapEncounterResult {
  heroDied: boolean;
}

export async function resolveTrapEncounter(
  hero: Hero,
  trapCat: TrapDef,
  level: number,
  stageDiff: RaidDifficulty,
  waitBeat: (key: BeatKey) => Promise<void>,
  slotEl: Element | null
): Promise<TrapEncounterResult> {
  triggerSurprise(hero);
  await waitBeat('threat');

  flashSlot(slotEl, 'triggered');
  await waitBeat('actionGap');

  var baseTrap = Math.round((trapCat.baseDamage + (level - 1) * trapCat.dmgPerLevel) * stageDiff.trapMult);
  var tMult = heroTrapMult(hero.classId, trapCat.id);
  var dmg = Math.round(baseTrap * tMult);

  if (hero.evasion && Math.random() < hero.evasion) {
    dmg = 0;
  }

  if (dmg > 0) {
    var spec = applySpecialOnTrap(hero, trapCat.id, trapCat.tags, dmg);
    dmg = spec.dmg;
    hero.hp -= dmg;
    triggerPain(hero);
    updateBattleCard(hero);
    checkPanic(hero);
  }

  if (trapCat.id === 'poison' && dmg > 0) {
    hero.status.push({ type: 'poison', rounds: trapCat.dotRounds || 0, dmg: Math.round(dmg * 0.4) });
  }
  if (trapCat.id === 'fire' && dmg > 0 && trapCat.burnRounds) {
    hero.status.push({ type: 'poison', rounds: trapCat.burnRounds, dmg: Math.round(dmg * 0.35) });
  }
  if (trapCat.id === 'net' && dmg > 0 && trapCat.atkReduction) {
    hero.atk = Math.round(hero.atk * (1 - trapCat.atkReduction));
  }

  await waitBeat('resolve');

  if (hero.hp <= 0) {
    flashSlot(slotEl, 'kill');
    triggerDeath(hero);
    return { heroDied: true };
  }
  return { heroDied: false };
}
