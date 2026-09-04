import type { Hero } from '../types';
import type { BeatKey } from '../animation/beatTiming';

export interface TreasureEncounterResult {
  goldReward: number;
}

export async function resolveTreasureEncounter(
  hero: Hero,
  goldReward: number,
  waitBeat: (key: BeatKey) => Promise<void>
): Promise<TreasureEncounterResult> {
  await waitBeat('threat');
  await waitBeat('actionGap');

  var result: TreasureEncounterResult = { goldReward };
  if (hero.hp > 0) {
    var stolen = Math.round(goldReward * 0.4 + 15);
    result.goldReward = Math.max(0, goldReward - stolen);
  }
  await waitBeat('resolve');
  return result;
}
