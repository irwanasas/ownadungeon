import type { Hero } from '../types';
import type { BeatKey } from '../animation/beatTiming';

export interface TreasureEncounterResult {
  goldReward: number;
  heroVictory: boolean;
}

export async function resolveTreasureEncounter(
  hero: Hero,
  goldReward: number,
  waitBeat: (key: BeatKey) => Promise<void>
): Promise<TreasureEncounterResult> {
  await waitBeat('threat');
  await waitBeat('actionGap');

  var result: TreasureEncounterResult = { goldReward, heroVictory: false };
  if (hero.hp > 0) {
    var stolen = Math.round(goldReward * 0.4 + 15);
    result.goldReward = Math.max(0, goldReward - stolen);
    result.heroVictory = true;
  }
  await waitBeat('resolve');
  return result;
}
